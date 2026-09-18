<template>
  <div
    class="relative"
    :class="[
      // `min-h-dvh` is the page filling the viewport. In preview it is a pane
      // inside an editor, so it must be content-height or the pane's scroller
      // is handed a screenful of empty space under every short form.
      preview ? '' : 'min-h-dvh',
      embed ? 'py-4' : 'pt-6 pb-12 sm:pt-8 sm:pb-16',
      centerTerminal && 'flex flex-col justify-center',
    ]"
  >
    <!-- Page chrome belongs to the host app, so it is a slot and is dropped
         entirely when embedded in someone else's iframe, and in preview where
         the panel supplies its own toolbar. -->
    <div
      v-if="!embed && !preview && $slots.chrome"
      class="border-border bg-background/95 supports-backdrop-filter:bg-background/90 fixed top-4 right-3 z-10 flex items-center gap-x-1 rounded-full border p-1 backdrop-blur-sm"
    >
      <slot name="chrome" :locales="formLocales" />
    </div>

    <!--
      `container sm:max-w-xl` is a VIEWPORT breakpoint. In a 450px preview pane
      on a desktop screen `sm:` still matches, so the form would be forced to
      576px and overflow the pane. Preview measures itself instead.
    -->
    <div :class="preview ? 'mx-auto w-full max-w-xl px-4' : 'container sm:max-w-xl'">
      <!-- Only forms that dedupe by fingerprint land here: the answer needs the
           browser, so the form is held back rather than shown and then retracted.
           Every other form renders straight from SSR with no placeholder. -->
      <div v-if="isCheckingDuplicate" class="space-y-8">
        <div class="space-y-2.5">
          <Skeleton class="h-8 w-3/5" />
          <Skeleton class="h-4 w-4/5" />
        </div>
        <div class="space-y-6">
          <div v-for="i in 3" :key="i" class="space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-11 w-full" />
          </div>
          <Skeleton class="h-11 w-full rounded-lg" />
        </div>
      </div>

      <!-- Terminal states (not open yet / closed / full / load error / success /
           already responded) share one Empty. Its root is `t-stagger`, so the
           header and the actions rise in on mount; nothing else moves. Painted
           neutral on purpose: a closed or missing form is not the visitor's
           fault, so it should not read as a failure they caused. -->
      <Empty
        v-else-if="statusCard"
        ref="terminalRef"
        tabindex="-1"
        class="outline-none"
        :class="embed ? 'px-0 py-6' : 'px-0 py-10'"
      >
        <EmptyHeader role="status">
          <EmptyMedia variant="stacked">
            <Icon :name="statusCard.icon" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h1>{{ statusCard.title }}</h1>
          </EmptyTitle>
          <EmptyDescription v-if="statusCard.description" class="whitespace-pre-line">
            {{ statusCard.description }}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent v-if="statusCard.actions.length">
          <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            <Button
              v-for="(action, index) in statusCard.actions"
              :key="action.key"
              :to="action.href"
              :variant="index === 0 ? 'default' : 'outline'"
              @click="action.onClick?.()"
            >
              <Icon :name="action.icon" class="size-4 shrink-0" aria-hidden="true" />
              <span>{{ action.label }}</span>
            </Button>
          </div>
        </EmptyContent>
      </Empty>

      <div v-else-if="form" class="relative">
        <!-- BlurImage sets inheritAttrs:false and binds $attrs to the inner <img>,
             so a class passed to it lands on the image. Spacing needs a wrapper.
             On phones the cover goes full-bleed: `-mx-4` cancels the container's
             px-4 and `-mt-6` cancels the page's pt-6, so it meets all three
             edges. From `sm` the page is a centred card again and it sits inside
             the padding like everything else. -->
        <div v-if="form.cover_image?.xl && !embed" class="-mx-4 -mt-6 mb-5 sm:mx-0 sm:mt-0 sm:mb-6">
          <BlurImage
            :src="form.cover_image.xl"
            :lqip="form.cover_image.lqip || ''"
            :srcset="coverSrcset"
            sizes="(min-width: 640px) 544px, 100vw"
            :alt="form.title"
            :width="1500"
            :height="500"
            loading="eager"
            fetchpriority="high"
            image-class="aspect-[3/1] w-full object-cover"
          />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tighter text-balance sm:text-3xl">
            {{ form.title }}
          </h1>

          <!-- Description and its toggle are one group, so the gap between them
               is set here rather than inherited from the header's space-y: the
               clamp deliberately ends mid-line, and 8px leaves the half-faded
               line looking like it collides with the button. -->
          <div v-if="form.description">
            <div
              :id="descId"
              class="pf-desc scroll-fade-b"
              :class="{ 'is-expanded': descExpanded, 'is-faded': descFaded }"
              :style="descStyle"
            >
              <div ref="descContent" class="typeset typeset-cms max-w-2xl" v-html="form.description" />
            </div>

            <button
              v-if="descOverflows || descExpanded"
              type="button"
              class="pf-desc-toggle text-muted-foreground hover:text-foreground mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-medium tracking-tight transition-colors"
              :class="{ 'is-expanded': descExpanded }"
              :aria-expanded="descExpanded"
              :aria-controls="descId"
              @click="descExpanded = !descExpanded"
            >
              <span>{{ descExpanded ? t("forms.showLess") : t("forms.showMore") }}</span>
              <ChevronDown class="pf-desc-chevron size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="bg-border my-6 h-px sm:my-8" />

        <!-- Two bodies, swapped at the form element rather than inside it:
             Questionnaire renders its own <form> and forms cannot nest. -->
        <component
          :is="isMultiStep ? PublicFormSteps : PublicFormFields"
          v-model:respondent-email="respondentEmail"
          v-model:honeypot="honeypotWebsite"
          :form="form"
          :fields="renderedFields"
          :responses="responses"
          :context-values="contextValues"
          :derived-system-keys="derivedSystemKeys"
          :form-errors="formErrors"
          :locale="locale"
          :upload-handlers="uploadHandlers"
          :submitting="submitting"
          :uploads-in-progress="uploadsInProgress"
          :submit-label="submitLabel"
          :preview="preview"
          @update:response="setResponse"
          @uploading="handleUploading"
          @submit="handleSubmit"
        />

        <!-- Vendor credit. The payload carries it only when the instance names
             a vendor and the tenant has not bought whitelabel; a builder draft
             never carries it, so preview stays clean without a special case. -->
        <p
          v-if="form.powered_by"
          class="text-muted-foreground mt-8 text-center text-xs tracking-tight sm:mt-10 sm:text-sm"
        >
          Powered by
          <a
            v-if="form.powered_by.url"
            :href="form.powered_by.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground underline underline-offset-2 transition-colors"
            >{{ form.powered_by.name }}</a
          >
          <template v-else>{{ form.powered_by.name }}</template>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, shallowRef, useId, watch } from "vue";
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import { ChevronDown } from "@lucide/vue";
import {
  availableFormLocales,
  buildCoverSrcset,
  duplicateModeFor,
  generateHoneypotToken,
  isClosedError,
  loadVisitorId,
  mapValidationErrors,
  sortFormFields,
} from "./core";
import PublicFormFields from "./PublicFormFields.vue";
import PublicFormSteps from "./PublicFormSteps.vue";
import { BlurImage } from "../blur-image";
import {
  prefillValueFor as coercePrefill,
  contextValuesFor,
  defaultValueFor,
  derivedFieldKeys,
  derivedFieldSlots,
  derivedLocationValues,
  supportsPrefill,
  usePhoneSeededCountry,
} from "../custom-field";
import { Button } from "../button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../empty";
import { Skeleton } from "../skeleton";

/**
 * The whole public form surface, shared verbatim between pmone.id/f/{slug} and
 * every event website's /f/{slug}. Everything host-specific is injected: the
 * page owns fetching (its meta title needs the payload), the endpoints, the
 * upload transport, and the chrome slot. Nothing in here may hardcode a URL.
 */
const props = defineProps({
  /** Payload from the public form endpoint, or null while unavailable. */
  form: { type: Object, default: null },
  /** useFetch error, kept raw so the 403/404 split stays in one place. */
  fetchError: { type: Object, default: null },
  /** Absolute or same-origin URLs: { check, submit }. Not used in preview. */
  endpoints: { type: Object, default: () => ({}) },
  /** { uploadHandler, revertHandler } from lib/uploadHandlers. */
  uploadHandlers: { type: Object, default: () => ({}) },
  /** Picks which translation of each field label is rendered. */
  locale: { type: String, default: "en" },
  embed: { type: Boolean, default: false },
  /**
   * Rendered inside the form builder against an unsaved draft rather than
   * served to a respondent. Nothing may reach the network: submit and the
   * duplicate pre-check are inert, and query prefill is ignored because the
   * route is the admin's, not the form's.
   */
  preview: { type: Boolean, default: false },
  /** Preview only: which terminal state to render. */
  previewState: {
    type: String,
    default: "form",
    validator: (value) => ["form", "success", "closed"].includes(value),
  },
});

const { t } = useI18n();
const route = useRoute();

const responses = ref({});
const respondentEmail = ref("");
const formErrors = ref({});
const submitting = ref(false);
const submitted = ref(false);
const alreadySubmitted = ref(false);
/** A 403 from submit: the form closed or filled up while it was being filled in. */
const submitUnavailable = ref(null);
const duplicateCheckDone = ref(false);
const uploadsInProgress = ref(0);
const visitorId = ref(null);
const honeypotWebsite = ref("");
const honeypotToken = ref("");

const sortedFields = computed(() => sortFormFields(props.form?.fields));

/**
 * What the body actually renders. A field the form answers on the respondent's
 * behalf is dropped rather than shown as a control nobody has to touch; it stays
 * in `sortedFields`, so it is still answered, still stored, still exported. In
 * the questionnaire body this also removes its step, so nobody is walked through
 * a question that fills itself in. See `derivedFieldKeys`.
 */
const renderedFields = computed(() => {
  const derived = derivedFieldKeys(sortedFields.value);
  return derived.size
    ? sortedFields.value.filter((field) => !derived.has(String(field.ulid)))
    : sortedFields.value;
});
const coverSrcset = computed(() => buildCoverSrcset(props.form?.cover_image));

// Absent on forms created before the setting existed, which is exactly the
// single-page behaviour they already had.
const isMultiStep = computed(() => props.form?.settings?.layout === "multi_step");

/**
 * The dependent location fields need to see their siblings' answers. Without
 * this, a province or city on a public form decides its country is missing and
 * withdraws itself, so neither has ever rendered on `/f/{slug}`, even for
 * Indonesia.
 */
const contextValues = computed(() => contextValuesFor(sortedFields.value, responses.value));

/**
 * A city whose province is filled in for the respondent must not narrow itself
 * to that province, or the list would collapse to one province the moment a
 * city is picked. See `derivedFieldSlots`.
 */
const derivedSystemKeys = computed(() => derivedFieldSlots(sortedFields.value));

const fieldOfType = (type) => sortedFields.value.find((field) => field?.type === type) ?? null;
const cityField = computed(() => fieldOfType("city"));
const phoneField = computed(() => fieldOfType("phone"));
const countryField = computed(() => fieldOfType("country"));

const regions = shallowRef(null);

watch(
  cityField,
  async (field) => {
    if (!field || regions.value) return;
    regions.value = await import("../custom-field/indonesiaRegions");
  },
  { immediate: true }
);

const setResponse = (ulid, value) => {
  responses.value[ulid] = value;

  // Answering a city answers its province too; see `derivedLocationValues`.
  const field = sortedFields.value.find((row) => String(row.ulid) === String(ulid));
  Object.assign(
    responses.value,
    derivedLocationValues(field, value, sortedFields.value, regions.value)
  );
};

/**
 * The form asks for a phone number before it asks where the respondent is, so
 * the country follows the number's dial code until they pick one themselves -
 * the same thing checkout does with the buyer's phone.
 */
usePhoneSeededCountry(
  () => (phoneField.value && countryField.value ? responses.value[phoneField.value.ulid] : ""),
  () => responses.value[countryField.value?.ulid],
  (label) => setResponse(countryField.value.ulid, label)
);

/* ----- Description clamp ----- */
/**
 * The description is author HTML of any length sitting between the title and the
 * first question, so a long one is clamped and opened by an explicit toggle.
 *
 * SSR renders the clamp but never the mask or the toggle. The server cannot
 * measure, and the alternative - render unclamped, then clamp on hydration -
 * yanks the whole form upward in front of the reader. A clamp that turns out to
 * be unnecessary is invisible (the content already fit inside it), so the only
 * post-hydration change is a mask fading in and a toggle appearing under it.
 */
const descId = useId();
const descContent = ref(null);
const descExpanded = ref(false);
const descOverflows = ref(false);
const descHeight = ref(0);
const descClamp = ref(0);

const descFaded = computed(() => descOverflows.value && !descExpanded.value);

/** Nominal clamp. Mirrors the `--pf-desc-max` fallback the CSS uses during SSR. */
const DESC_CLAMP_REM = 14;

/**
 * Where inside a line the cut lands, as a fraction of the line box. Has to clear
 * the half-leading above the glyphs - land at 0.2 and the "visible" sliver is
 * blank space, which reads exactly like the paragraph having ended.
 */
const DESC_CUT_INTO_LINE = 0.6;

/** Text-bearing blocks. The cut is aligned to these, not to wrappers. */
const DESC_BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, blockquote, pre, figcaption, td, th";

/**
 * A clamp is only legible as a clamp if it slices a line in half. Left at a round
 * number it lands wherever it lands - most often in the margin between two
 * paragraphs, where the gradient has nothing but whitespace to fade and the
 * description reads as simply having ended.
 *
 * So the nominal clamp is snapped onto the nearest line box below it: the reader
 * gets a half-shown line under the gradient, which is the one unambiguous "keep
 * going" cue a clamp can give.
 */
const resolveDescClamp = (content) => {
  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const nominal = DESC_CLAMP_REM * rootSize;

  // Children lay out at full height regardless of the clamp - `max-height` plus
  // `overflow: hidden` clips, it does not reflow - so these rects are honest in
  // either state.
  const contentTop = content.getBoundingClientRect().top;
  let target = null;

  for (const el of content.querySelectorAll(DESC_BLOCKS)) {
    const rect = el.getBoundingClientRect();
    const top = rect.top - contentTop;
    const bottom = rect.bottom - contentTop;

    // The block the cut already falls inside wins outright. Otherwise remember
    // the nearest one starting below it, for when the cut is in a margin.
    if (top < nominal && nominal < bottom) {
      target = { el, top };
      break;
    }
    if (top >= nominal && (!target || top < target.top)) {
      target = { el, top };
    }
  }

  if (!target) return nominal;

  const lineHeight =
    parseFloat(getComputedStyle(target.el).lineHeight) ||
    target.el.getBoundingClientRect().height ||
    rootSize * 1.5;

  // Which line of that block the cut is in - 0 when the cut sits above it.
  const line = Math.max(0, Math.floor((nominal - target.top) / lineHeight));

  return Math.round(target.top + (line + DESC_CUT_INTO_LINE) * lineHeight);
};

// Both lengths are measured rather than guessed: max-height interpolates between
// two lengths, so exact endpoints keep the easing honest instead of spending most
// of the curve on empty space. The 8px of slack on the open end keeps
// `overflow: hidden` from shaving a focus ring off a link on the last line.
const descStyle = computed(() => ({
  "--pf-desc-max": descClamp.value ? `${descClamp.value}px` : undefined,
  maxHeight: descExpanded.value ? `${descHeight.value + 8}px` : undefined,
}));

const measureDescription = () => {
  const content = descContent.value;
  if (!content) return;

  descHeight.value = Math.ceil(content.getBoundingClientRect().height);
  descClamp.value = resolveDescClamp(content);
  descOverflows.value = descHeight.value - descClamp.value > 1;
};

// One observer is enough. The content's border box changes on every reflow that
// matters - viewport width, a late web font, an image inside the description
// finishing, a locale switch - and it does NOT fire while max-height animates,
// so there is no observer loop to guard against.
useResizeObserver(descContent, measureDescription);

// Handed to the chrome slot so the host can scope its language switcher to the
// languages this particular form actually has.
const formLocales = computed(() => availableFormLocales(props.form));

const submitLabel = computed(() => {
  if (uploadsInProgress.value > 0) return t("forms.uploadingFiles");
  return submitting.value ? t("forms.submitting") : t("forms.submit");
});

const handleUploading = (active) => {
  uploadsInProgress.value = Math.max(0, uploadsInProgress.value + (active ? 1 : -1));
};

/**
 * A date and time in the zone the API keeps them in, so the server render and
 * the browser agree on the text (a visitor's own zone would change it during
 * hydration) and the zone is named in the string so nobody misreads it.
 */
const formatWhen = (iso, timeZone) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  try {
    return new Intl.DateTimeFormat(props.locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone || undefined,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return null;
  }
};

/**
 * Why the form is not taking responses, from the 403 body. Older API builds
 * sent only a message, which reads as "closed".
 */
const unavailableCopy = (body) => {
  const reason = body?.reason ?? "closed";
  const ownWords = body?.closed_message || null;

  if (reason === "not_open") {
    const when = formatWhen(body?.opens_at, body?.timezone);
    return {
      icon: "hugeicons:clock-01",
      title: t("forms.notOpenTitle"),
      description: when
        ? t("forms.notOpenMessage", { date: when })
        : t("forms.notOpenMessageNoDate"),
    };
  }

  if (reason === "full") {
    return {
      icon: "hugeicons:user-block-01",
      title: t("forms.fullTitle"),
      description: ownWords || t("forms.fullMessage"),
    };
  }

  const closedOn = body?.reason ? formatWhen(body?.closes_at, body?.timezone) : null;
  return {
    icon: "hugeicons:calendar-remove-01",
    title: t("forms.closedTitle"),
    description:
      ownWords ||
      (closedOn ? t("forms.closedMessageDate", { date: closedOn }) : null) ||
      // An old API put the organiser's wording, or its own English default,
      // in `message`; only the former is worth showing.
      (body?.reason ? null : body?.message) ||
      t("forms.closedMessage"),
  };
};

/** The organiser, from the form payload or, when there is no form, the 403 body. */
const organizer = computed(
  () => props.form?.organizer ?? submitUnavailable.value?.organizer ?? props.fetchError?.data?.organizer ?? null
);

/**
 * Every terminal state gets somewhere to go next. The organiser's website is
 * the one exit that makes sense on every host - pmone.id has nothing a
 * respondent should land on, and an event site's own home is usually that same
 * website - so it is offered wherever it exists.
 */
const organizerAction = computed(() =>
  organizer.value?.website
    ? {
        key: "organizer",
        icon: "hugeicons:arrow-up-right-01",
        label: t("forms.visitOrganizer", { name: organizer.value.name }),
        href: organizer.value.website,
      }
    : null
);

const actionsFrom = (...actions) => actions.filter(Boolean);

const statusCard = computed(() => {
  // The builder's state switcher: the confirmation and closed copy are edited
  // on another tab, so they need to be viewable without actually submitting the
  // form or closing it.
  if (props.preview && props.previewState !== "form") {
    if (props.previewState === "success") {
      return successCard.value;
    }

    return {
      ...unavailableCopy({ reason: "closed", closed_message: props.form?.settings?.closed_message }),
      actions: actionsFrom(organizerAction.value),
    };
  }

  if (props.fetchError || submitUnavailable.value) {
    const body = submitUnavailable.value ?? props.fetchError.data;

    if (submitUnavailable.value || isClosedError(props.fetchError)) {
      return { ...unavailableCopy(body), actions: actionsFrom(organizerAction.value) };
    }

    // Only reached when embedded: a standalone page sends these to error.vue.
    const status = props.fetchError.statusCode || props.fetchError.data?.statusCode;
    if (status === 404) {
      return {
        icon: "hugeicons:search-01",
        title: t("forms.notFoundTitle"),
        description: t("forms.notFoundMessage"),
        actions: [],
      };
    }

    return {
      icon: "hugeicons:cloud-off",
      title: t("forms.errorTitle"),
      description: t("forms.errorMessage"),
      actions: [
        {
          key: "retry",
          icon: "hugeicons:reload",
          label: t("forms.tryAgain"),
          onClick: () => window.location.reload(),
        },
      ],
    };
  }

  if (submitted.value) {
    return successCard.value;
  }

  if (alreadySubmitted.value && props.form) {
    return {
      icon: "hugeicons:task-done-01",
      title: t("forms.alreadyTitle"),
      description: t("forms.alreadyMessage"),
      actions: actionsFrom(organizerAction.value),
    };
  }

  return null;
});

/**
 * The organiser's own confirmation wins; ours names them when we know who they
 * are. "Submit another response" only where the form accepts more than one per
 * person - offering it on a deduplicated form would lead straight to a 409.
 */
const successCard = computed(() => ({
  icon: "hugeicons:checkmark-circle-02",
  title: t("forms.successTitle"),
  description:
    props.form?.settings?.confirmation_message ||
    (organizer.value?.name
      ? t("forms.successMessageOrganizer", { name: organizer.value.name })
      : t("forms.successMessage")),
  actions: actionsFrom(
    !props.form?.settings?.prevent_duplicate && {
      key: "again",
      icon: "hugeicons:add-01",
      label: t("forms.submitAnother"),
      onClick: startOver,
    },
    organizerAction.value
  ),
}));

const duplicateMode = computed(() => duplicateModeFor(props.form?.settings));

const isCheckingDuplicate = computed(
  () => !props.preview && duplicateMode.value.checksFingerprint && !duplicateCheckDone.value
);

/**
 * A terminal card is the whole page - there is no form under it to anchor the
 * eye - so it centres in the viewport instead of hanging off the top of a
 * min-h-dvh box. Embedded stays top-aligned: a host sizing its iframe to content
 * should not be handed a screenful of centred whitespace.
 */
const centerTerminal = computed(
  () => !props.embed && !isCheckingDuplicate.value && !!statusCard.value
);

// Submitting tears the <form> out from under the focused button, dropping focus
// to <body>. role="status" reads the outcome out loud; this is what keeps the
// keyboard caret somewhere sensible.
const terminalRef = ref(null);

watch(statusCard, async (card) => {
  if (!card) return;
  await nextTick();
  terminalRef.value?.$el?.focus?.();
});

const runDuplicateCheck = async (email = null) => {
  if (props.preview) return;

  const params = new URLSearchParams();
  if (email) params.append("email", email);
  if (visitorId.value) params.append("fingerprint", visitorId.value);
  if (![...params].length) return;

  try {
    const result = await $fetch(`${props.endpoints.check}?${params}`);
    if (result.already_submitted) {
      alreadySubmitted.value = true;
    }
  } catch {
    // A failed pre-check is not fatal - submit still rejects duplicates with 409.
  }
};

// Debounced rather than per-keystroke, which used to fire one request per
// character typed after the "@". Watching the value (not blur) covers autofill.
const checkEmailForDuplicate = useDebounceFn(() => {
  if (duplicateMode.value.checksEmail && respondentEmail.value.includes("@")) {
    runDuplicateCheck(respondentEmail.value);
  }
}, 500);

watch(respondentEmail, checkEmailForDuplicate);

onMounted(async () => {
  // Ahead of the observer's first (next-frame) callback, so the mask and the
  // toggle are already correct in the first painted frame after hydration.
  measureDescription();

  if (props.preview) {
    duplicateCheckDone.value = true;
    return;
  }

  honeypotToken.value = generateHoneypotToken();
  visitorId.value = await loadVisitorId();

  if (duplicateMode.value.checksFingerprint) {
    await runDuplicateCheck();
  }
  duplicateCheckDone.value = true;
});

// Prefill a field from URL query params (?{ulid}=value or ?{param_key}=value).
// The view owns query extraction; per-type coercion lives in custom-field/core.
const prefillValueFor = (field) => {
  if (props.preview) return undefined;
  if (!supportsPrefill(field.type)) return undefined;

  const paramKey = field.settings?.param_key;
  const raw = route.query[field.ulid] ?? (paramKey ? route.query[paramKey] : undefined);

  return coercePrefill(field, raw);
};

const seedResponses = (fields) => {
  for (const field of fields) {
    if (field.type !== "section" && responses.value[field.ulid] === undefined) {
      responses.value[field.ulid] = prefillValueFor(field) ?? defaultValueFor(field);
    }
  }
};

watch(sortedFields, seedResponses, { immediate: true });

/**
 * "Submit another response": a blank form again, as if the page had just been
 * opened (URL prefill included), with a fresh honeypot clock so the second
 * submission is not mistaken for a bot filling the form in a second.
 */
function startOver() {
  responses.value = {};
  seedResponses(sortedFields.value);
  respondentEmail.value = "";
  formErrors.value = {};
  honeypotToken.value = generateHoneypotToken();
  submitted.value = false;
  nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Scroll the first invalid field into view after server-side validation. In
// multi-step the offending field is usually not even on screen, so that body
// switches to it instead and there is nothing to scroll to.
const scrollToFirstError = async () => {
  if (isMultiStep.value) return;

  await nextTick();
  const target = document.querySelector("[data-field-error]") || document.querySelector("form");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const handleSubmit = async () => {
  if (props.preview || alreadySubmitted.value) return;

  submitting.value = true;
  formErrors.value = {};

  try {
    const result = await $fetch(props.endpoints.submit, {
      method: "POST",
      body: {
        responses: responses.value,
        respondent_email: respondentEmail.value || null,
        browser_fingerprint: visitorId.value,
        website: honeypotWebsite.value,
        _token_time: honeypotToken.value,
      },
    });

    if (result.redirect_url) {
      window.location.href = result.redirect_url;
      return;
    }

    submitted.value = true;
  } catch (err) {
    if (err.status === 422 && err.data?.errors) {
      formErrors.value = mapValidationErrors(err.data.errors);
      scrollToFirstError();
    } else if (err.status === 409) {
      alreadySubmitted.value = true;
    } else if (err.status === 403) {
      // Closed or filled up while it was open in this tab.
      submitUnavailable.value = err.data ?? {};
    } else {
      // The server's own text here is a transport or framework message in
      // English, not something to put in front of a visitor.
      formErrors.value._general = t("forms.submitFailed");
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Description clamp + reveal, on transitions.dev 21 (accordion expand) tokens.
   Plain CSS, no @apply: this file has no `@reference`, and everything it needs
   is already a global custom property.

   Why not the accordion's grid-template-rows 0fr -> 1fr: that trick expresses
   "nothing -> auto". This is "N lines -> auto", which has no fr equivalent, so
   max-height carries the tween and the rest of the snippet is unchanged.

   Why scroll-fade-b is kept but its animation killed: the utility drives its
   length from a scroll timeline, and a scroll timeline on an `overflow: hidden`
   box is inactive, so --scroll-fade-b falls back to the 0px initial value of its
   @property registration and no fade ever paints. `animation: none` states that
   outright and leaves a registered <length-percentage> we own - and can
   transition, which `mask-image` itself cannot. Only the length is ours; the
   mask plumbing stays the utility's.

   This works without !important because Vue injects scoped styles unlayered,
   and every Tailwind utility lives in @layer utilities. Unlayered wins. */
.pf-desc {
  /* SSR fallback only. Once mounted, JS overwrites --pf-desc-max inline with a
     px value nudged so the cut lands inside a line of text - see
     resolveDescClamp. Keep the two in step (DESC_CLAMP_REM). */
  --pf-desc-max: 14rem;
  --scroll-fade-b: 0px;
  animation: none;
  overflow: hidden;
  max-height: var(--pf-desc-max);
  /* Declared on the resting rule, so this is the collapse leg. */
  transition:
    max-height var(--acc-collapse) var(--acc-ease),
    --scroll-fade-b var(--acc-collapse) var(--acc-ease);
}

.pf-desc.is-expanded {
  transition:
    max-height var(--acc-expand) var(--acc-ease),
    --scroll-fade-b var(--acc-expand) var(--acc-ease);
}

/* Painted only once JS has confirmed the content really overflows, so a short
   description is never fringed with a fade that means nothing. Roughly one line
   tall on purpose: any deeper and it swallows the half-shown line the clamp
   works to expose, leaving the reader with no visible evidence of a cut. */
.pf-desc.is-faded {
  --scroll-fade-b: 2rem;
}

/* A block formatting context, so the child's own margins stay inside its border
   box - the measured height has to be the exact max-height target. Typeset
   zeroes the first block's margin, but the flow-root is still needed so the
   child's own bottom margin cannot escape the measured box. */
.pf-desc > .typeset {
  display: flow-root;
}

.pf-desc-toggle {
  animation: pf-toggle-in var(--acc-expand) var(--acc-ease) both;
}

/* The keyframe and the `animation` shorthand that drives it must stay in this
   same scoped block: the SFC compiler renames them together. Never reference it
   from a Tailwind `animate-[...]` class - that string is emitted into the global
   stylesheet and never sees the rename. */
@keyframes pf-toggle-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* scaleY, never a `d:` path morph - CSS path interpolation is Chromium-only. */
.pf-desc-chevron {
  transition: transform var(--acc-chevron) var(--acc-ease);
}

.pf-desc-toggle.is-expanded .pf-desc-chevron {
  transform: scaleY(-1);
}

@media (prefers-reduced-motion: reduce) {
  .pf-desc,
  .pf-desc.is-expanded,
  .pf-desc-chevron {
    transition: none !important;
  }
  .pf-desc-toggle {
    animation: none !important;
  }
}
</style>
