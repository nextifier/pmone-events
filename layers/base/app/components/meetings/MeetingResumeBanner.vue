<!--
  After a confirmed checkout: signs the buyer in for meetings (they just proved
  who they are), then either offers to finish the meeting request they started
  before buying, or points them at the exhibitors when the event runs meetings.
  Renders nothing when the event doesn't.
-->
<template>
  <div v-if="mode" class="frame">
    <div class="frame-panel flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4">
      <div class="space-y-1">
        <p class="text-base font-medium tracking-tight">
          {{ mode === "resume" ? $t("meetings.resume.title", { brand: intentBrand }) : $t("meetings.resume.promoTitle") }}
        </p>
        <p class="text-muted-foreground text-sm tracking-tight">
          {{ bodyText }}
        </p>
      </div>
      <Button :to="target" class="shrink-0">
        {{ mode === "resume" ? $t("meetings.resume.cta") : $t("meetings.actions.browseExhibitors") }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from "../ui/button";
import { computed, onMounted, ref } from "vue";

const props = defineProps({
  orderToken: { type: String, default: null },
  orderUlid: { type: String, default: null },
});

const event = useEvent();
const localePath = useLocalePath();
const intent = useMeetingIntent();
const { exchange } = useVisitorSession();

const mode = ref(null);
const saved = ref(null);
const signedIn = ref(false);
const opensAt = ref(null);
const zone = ref("Asia/Jakarta");
const { t, locale } = useI18n();

// What the banner promises matches what happened: signed in or not, and
// whether requests are open yet.
const bodyText = computed(() => {
  if (opensAt.value) {
    return t("meetings.panel.notOpen", { date: meetingWhenAt(opensAt.value) });
  }
  if (mode.value === "resume") return signedIn.value ? t("meetings.resume.body") : t("meetings.resume.bodySignIn");
  return signedIn.value ? t("meetings.resume.promoBody") : t("meetings.resume.promoBodySignIn");
});

function meetingWhenAt(iso) {
  const tz = zone.value;
  return `${meetingDay(iso, tz, locale.value)} ${meetingClock(iso, tz)} ${meetingZone(tz)}`;
}

const intentBrand = computed(() => saved.value?.brand_name || "");
const target = computed(() => {
  if (mode.value === "resume" && saved.value?.brand_slug) {
    const slot = saved.value.slot ? `?slot=${encodeURIComponent(saved.value.slot)}` : "";
    return `${localePath(`/brands/${saved.value.brand_slug}`)}${slot}`;
  }
  return `${localePath("/brands")}?meetings=1`;
});

onMounted(async () => {
  await useEventData();
  saved.value = intent.read();
  const slug = saved.value?.event_slug || event.slug;
  if (!slug) return;

  let config = null;
  try {
    config = (await $fetch(`/api/meetings/${slug}/config`))?.data ?? null;
  } catch {
    return;
  }
  if (!config || config.window === "closed") return;

  let visitor = null;
  try {
    visitor = await exchange(slug, { order_token: props.orderToken || null, order_ulid: props.orderUlid || null });
  } catch {
    // Still useful without the session: the visitor signs in with their email.
  }
  signedIn.value = !!visitor;

  // A ticket that doesn't include meetings gets no invitation to book them.
  const status = visitor?.eligibility?.status;
  if (status && status !== "eligible") return;

  zone.value = config.timezone || zone.value;
  if (config.window === "not_open" && config.opens_at) opensAt.value = config.opens_at;
  mode.value = saved.value?.brand_slug ? "resume" : "promo";
});
</script>
