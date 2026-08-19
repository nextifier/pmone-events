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
 * The label names the edition by its ordinal ("Previous edition · 26th") rather
 * than its full title. The title is almost always the site's own name with an
 * edition marker appended, so it cost a wrapped second line on a 390px phone
 * and returned nothing the ordinal does not already say. Keeping it short is
 * what lets this sit in `Badge`, whose contract is `whitespace-nowrap`.
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

const edition = computed(() => props.source?.edition_label || "");

const label = computed(() =>
  edition.value
    ? t("fallbackNotice.labelWithEdition", { edition: edition.value })
    : t("fallbackNotice.label"),
);
</script>
