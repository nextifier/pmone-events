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
          {{ mode === "resume" ? $t("meetings.resume.body") : $t("meetings.resume.promoBody") }}
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

const intentBrand = computed(() => saved.value?.brand_name || "");
const target = computed(() => {
  if (mode.value === "resume" && saved.value?.brand_slug) {
    const slot = saved.value.slot ? `?slot=${encodeURIComponent(saved.value.slot)}` : "";
    return `${localePath(`/brands/${saved.value.brand_slug}`)}${slot}`;
  }
  return localePath("/brands");
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

  try {
    await exchange(slug, { order_token: props.orderToken || null, order_ulid: props.orderUlid || null });
  } catch {
    // Still useful without the session: the visitor signs in with their email.
  }

  mode.value = saved.value?.brand_slug ? "resume" : "promo";
});
</script>
