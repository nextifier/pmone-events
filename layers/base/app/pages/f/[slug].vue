<template>
  <PublicFormView
    :form="form"
    :fetch-error="fetchError"
    :endpoints="endpoints"
    :upload-handlers="uploadHandlers"
    :locale="locale"
  />
</template>

<script setup>
import { computed, onUnmounted, watchEffect } from "vue";
import {
  availableFormLocales,
  isClosedError,
  PublicFormView,
} from "../../components/ui/public-form";
import { createPublicFormUploadHandlers } from "../../lib/uploadHandlers";

// The site header carries the language switcher and colour-mode toggle, so the
// view's own chrome slot stays empty here: filling it would double them up.
definePageMeta({
  layout: "default",
  noFooter: true,
});

/**
 * Do NOT opt this page out of i18n routing. Excluding it looks like the way to
 * hold the URL to a single unprefixed path, but under `prefix_except_default` it
 * drops the route from i18n's locale map, the routing middleware then finds no
 * locale match, and the visitor is bounced to the homepage. SSR never runs that
 * middleware, so the page renders once and is thrown away on hydration - which
 * makes it look fine over curl and broken in a browser.
 *
 * The canonical URL is `/f/{slug}` either way, matching pmone.id. The prefixed
 * variants exist but are harmless: this page is noindex, it is not in the sitemap,
 * and CACHED_HTML_PREFIX matches after the locale segment is stripped.
 */

const route = useRoute();
const { locale } = useI18n();
const event = useEvent();
const slug = computed(() => route.params.slug);

const base = computed(() => `/api/forms/${slug.value}`);

const endpoints = computed(() => ({
  check: `${base.value}/check`,
  submit: `${base.value}/submit`,
}));

const uploadHandlers = computed(() => createPublicFormUploadHandlers(`${base.value}/upload`));

// Same-origin BFF proxy; the X-API-Key is injected server side. The SSR shell is
// identical for every visitor - prefill, duplicate check and label translation
// all happen client-side after mount - so this response is edge-cacheable.
const { data: formResponse, error: fetchError } = await useFetch(base, {
  key: `public-form-${slug.value}`,
});

const form = computed(() => formResponse.value?.data || null);

// A missing form is a genuine not-found page, so surface it through the shared
// error.vue boundary. A 403 (closed / not yet open / limit reached) stays inline
// as a neutral card carrying the owner's own closed_message.
if (fetchError.value && !isClosedError(fetchError.value)) {
  throw createError({
    statusCode: fetchError.value.statusCode || fetchError.value.data?.statusCode || 404,
    statusMessage: fetchError.value.data?.message || "Form not found",
    fatal: true,
  });
}

// Scope the header's switcher to the languages this form was authored in, and
// hand it back on the way out so the next page is not stuck with the same list.
const localeScope = useLocaleScope();
watchEffect(() => {
  localeScope.value = availableFormLocales(form.value);
});
onUnmounted(() => {
  localeScope.value = null;
});

/**
 * Title and description are the form's own, matching how brands/[slug] feeds
 * usePageMeta. The site name is appended by the shared titleTemplate, and the
 * generated Takumi OG card is built from these two values - so appending the
 * event title here would both duplicate it and truncate the card at the "&".
 */
usePageMeta(null, {
  title: computed(() => form.value?.title ?? event.title),
  description: computed(() =>
    (form.value?.description ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ),
});

// Public forms should never be indexed.
useSeoMeta({ robots: "noindex, nofollow" });
</script>
