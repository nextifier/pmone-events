<template>
  <div class="container mx-auto max-w-3xl space-y-8 px-4 pt-6 pb-20">
    <div class="space-y-2">
      <h1 class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl">{{ $t("meetings.mine.title") }}</h1>
      <p v-if="visitor" class="text-muted-foreground text-sm tracking-tight">
        {{ $t("meetings.signIn.signedInAs", { email: visitor.email }) }}
        <Button variant="link" size="sm" class="h-auto p-0 align-baseline" @click="signOut">{{ $t("meetings.signIn.signOut") }}</Button>
      </p>
    </div>

    <div v-if="state === 'loading'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-44 w-full rounded-xl" />
    </div>

    <p v-else-if="linkFailed" class="text-muted-foreground border-border rounded-xl border border-dashed px-3 py-2.5 text-sm tracking-tight">
      {{ $t("meetings.signIn.linkInvalid") }}
    </p>

    <MeetingSignIn
      v-if="state === 'signed-out' && eventSlug"
      :event-slug="eventSlug"
      :event-title="event.title"
      @signed-in="loadMeetings"
    />

    <template v-else-if="state === 'ready'">
      <div v-if="!meetings.length" class="border-border space-y-2 rounded-xl border border-dashed p-6 text-center">
        <p class="text-base font-medium tracking-tight">{{ $t("meetings.mine.emptyTitle") }}</p>
        <p class="text-muted-foreground text-sm tracking-tight">{{ $t("meetings.mine.emptyBodySite") }}</p>
        <Button variant="outline" :to="localePath('/brands')" class="mt-2">{{ $t("meetings.actions.browseExhibitors") }}</Button>
      </div>

      <section v-for="group in groups" :key="group.key" class="space-y-3">
        <h2 class="text-base font-medium tracking-tight">
          {{ group.label }} <span class="text-muted-foreground tabular-nums">· {{ group.items.length }}</span>
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MeetingVisitorCard
            v-for="meeting in group.items"
            :key="meeting.ulid"
            :meeting="meeting"
            :brand-path="meeting.brand?.slug ? localePath(`/brands/${meeting.brand.slug}`) : null"
            :busy="busy"
            @cancel="askCancel"
            @take-suggestion="takeSuggestion"
            @answer="answer"
          />
        </div>
      </section>

      <MeetingSuggestions :items="suggestions" :to="(item) => localePath(`/brands/${item.slug}`)" />
    </template>

    <p v-else-if="state === 'error'" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.mine.loadFailed") }}
      <Button variant="link" size="sm" class="h-auto p-0" @click="loadMeetings">{{ $t("meetings.common.retry") }}</Button>
    </p>

    <ResponsiveDialog v-model:open="cancelOpen" :title="$t('meetings.cancel.title')">
      <div v-if="toCancel" class="space-y-4 px-4 pt-5 pb-8 md:px-6 md:py-5">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">
            {{ toCancel.status === "accepted" ? $t("meetings.cancel.titleMeeting") : $t("meetings.cancel.titleRequest") }}
          </h2>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{
              toCancel.status === "accepted"
                ? $t("meetings.cancel.bodyMeeting", { brand: toCancel.brand?.name, when: meetingWhen(toCancel, locale) })
                : $t("meetings.cancel.bodyRequest", { brand: toCancel.brand?.name })
            }}
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" @click="cancelOpen = false">{{ $t("meetings.cancel.keep") }}</Button>
          <Button variant="destructive" :loading="busy === 'cancel'" @click="confirmCancel">
            {{ toCancel.status === "accepted" ? $t("meetings.actions.cancelMeeting") : $t("meetings.actions.cancelRequest") }}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  </div>
</template>

<script setup>
import MeetingSignIn from "../components/meetings/MeetingSignIn.vue";
import MeetingSuggestions from "../components/meetings/MeetingSuggestions.vue";
import MeetingVisitorCard from "../components/meetings/MeetingVisitorCard.vue";
import { Button } from "../components/ui/button";
import ResponsiveDialog from "../components/ui/responsive-dialog/ResponsiveDialog.vue";
import { Skeleton } from "../components/ui/skeleton";
import { computed, onMounted, ref } from "vue";
import { toast } from "vue-sonner";

definePageMeta({ bottomNav: false });

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const event = useEvent();
const { visitor, load: loadVisitor, exchange, signOut: endSession } = useVisitorSession();

const state = ref("loading");
const meetings = ref([]);
const suggestions = ref([]);
const busy = ref(null);
const linkFailed = ref(false);
const cancelOpen = ref(false);
const toCancel = ref(null);

const eventSlug = computed(() => event.slug);

const groups = computed(() => {
  const now = Date.now();
  const ahead = (m) => new Date(m.ends_at).getTime() > now;
  const invited = meetings.value.filter((m) => m.awaits_visitor && ahead(m));
  const confirmed = meetings.value.filter((m) => m.status === "accepted" && ahead(m));
  const waiting = meetings.value.filter((m) => m.status === "pending" && !m.awaits_visitor && ahead(m));
  const rest = meetings.value
    .filter((m) => !invited.includes(m) && !confirmed.includes(m) && !waiting.includes(m))
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));
  return [
    { key: "invited", label: t("meetings.mine.invitations"), items: invited },
    { key: "confirmed", label: t("meetings.mine.confirmed"), items: confirmed },
    { key: "waiting", label: t("meetings.mine.waiting"), items: waiting },
    { key: "closed", label: t("meetings.mine.closed"), items: rest },
  ].filter((g) => g.items.length);
});

async function loadMeetings() {
  if (!eventSlug.value) return;
  try {
    const res = await $fetch(`/api/meetings/${eventSlug.value}/mine`);
    meetings.value = res.data ?? [];
    state.value = "ready";
    loadSuggestions();
  } catch (err) {
    state.value = err?.statusCode === 401 ? "signed-out" : "error";
  }
}

/** Quiet on failure: the meetings above are what the page is for. */
async function loadSuggestions() {
  try {
    const res = await $fetch(`/api/meetings/${eventSlug.value}/suggestions`);
    suggestions.value = res.data ?? [];
  } catch {
    suggestions.value = [];
  }
}

async function signOut() {
  await endSession();
  meetings.value = [];
  suggestions.value = [];
  state.value = "signed-out";
}

function askCancel(meeting) {
  toCancel.value = meeting;
  cancelOpen.value = true;
}

async function confirmCancel() {
  busy.value = "cancel";
  try {
    await $fetch(`/api/meetings/${eventSlug.value}/mine/${toCancel.value.ulid}/cancel`, { method: "POST" });
    cancelOpen.value = false;
    toast.success(t("meetings.cancel.done"));
  } catch (err) {
    toast.error(meetingErrorText({ data: err?.data?.data ?? err?.data }, t));
  } finally {
    busy.value = null;
    await loadMeetings();
  }
}

async function answer(meeting, choice) {
  busy.value = `${choice}:${meeting.ulid}`;
  try {
    await $fetch(`/api/meetings/${eventSlug.value}/mine/${meeting.ulid}/${choice}`, { method: "POST" });
    toast.success(choice === "accept" ? t("meetings.request.bookedTitle") : t("meetings.invite.declinedByYou"));
  } catch (err) {
    toast.error(meetingErrorText({ data: err?.data?.data ?? err?.data }, t));
  } finally {
    busy.value = null;
    await loadMeetings();
  }
}

async function takeSuggestion(meeting, key) {
  busy.value = key;
  try {
    await $fetch(`/api/meetings/${eventSlug.value}/mine/${meeting.ulid}/accept-suggestion`, { method: "POST", body: { key } });
    toast.success(t("meetings.request.bookedTitle"));
  } catch (err) {
    toast.error(meetingErrorText({ data: err?.data?.data ?? err?.data }, t));
  } finally {
    busy.value = null;
    await loadMeetings();
  }
}

onMounted(async () => {
  await useEventData();
  if (!eventSlug.value) {
    state.value = "error";
    return;
  }

  // A meeting email's link signs the visitor in; the token leaves the URL at once.
  const token = typeof route.query.login === "string" ? route.query.login : null;
  if (token) {
    const { login, ...rest } = route.query;
    router.replace({ query: rest });
    try {
      await exchange(eventSlug.value, { login_token: token });
    } catch {
      linkFailed.value = true;
    }
  }

  await loadVisitor(eventSlug.value, { force: true });
  if (!visitor.value) {
    state.value = "signed-out";
    return;
  }
  await loadMeetings();
});

usePageMeta("", { title: computed(() => t("meetings.mine.title")) });
</script>
