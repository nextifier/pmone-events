<template>
  <Badge v-if="source" variant="muted" icon="lucide:history" :class="cn('mx-auto', props.class)">
    {{ label }}
  </Badge>
</template>

<script setup>
import { cn } from "@/lib/utils";

/**
 * Marks a section whose data was borrowed from a previous event edition (the
 * active event has none of its own yet). `source` is the API's
 * `meta.fallback.source_event` payload; pass null to render nothing.
 *
 * The label names the edition by its number ("Previous edition · 26th") rather
 * than its full title. The title is almost always the site's own name with an
 * edition marker appended, so it cost a wrapped second line on a 390px phone
 * and returned nothing the number does not already say. Keeping it short is
 * what lets this sit in `Badge`, whose contract is `whitespace-nowrap`.
 *
 * The number and the English "th"/"nd" suffix go in as separate params: only
 * English appends a suffix, so "26th" is "ke-26" in Indonesian and "第26回" in
 * Japanese. Those locales simply never reference {ordinal}.
 *
 * Not used on FAQ: `FaqTemplate` resolves `{{event_title}}`, `{{event_date}}`
 * and friends against the ACTIVE event, so a borrowed FAQ already reads as the
 * current edition's and the notice would contradict the answers below it.
 */
const props = defineProps({
  source: { type: Object, default: null },
  class: { type: null, default: undefined },
});

const { t } = useI18n();

const editionNumber = computed(() => props.source?.edition_number ?? null);

/** "26th" minus "26" - the API only ships the English ordinal, pre-joined. */
const editionOrdinal = computed(() => {
  const label = props.source?.edition_label || "";
  const number = editionNumber.value;
  return number != null && label
    ? String(label).replace(String(number), "")
    : "";
});

const label = computed(() =>
  editionNumber.value != null
    ? t("fallbackNotice.labelWithEdition", {
        n: editionNumber.value,
        ordinal: editionOrdinal.value,
      })
    : t("fallbackNotice.label"),
);
</script>
