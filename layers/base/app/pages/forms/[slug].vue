<template>
  <div class="bg-muted/30 dark:bg-background min-h-[70dvh]">
    <div class="mx-auto w-full max-w-2xl px-4 pt-6 pb-12 sm:pt-8 sm:pb-16">
      <!-- Skeleton loading -->
      <template v-if="isLoading">
        <div class="bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div class="space-y-8 p-6 sm:p-8">
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
        </div>
      </template>

      <!-- Status card (closed / success / already submitted). Result brings its own
           entrance, so this card no longer carries animate-in classes. -->
      <Result
        v-else-if="statusCard"
        size="sm"
        class="bg-card rounded-2xl border p-8 shadow-sm sm:p-12"
        :status="statusCard.status"
        :variant="statusCard.variant"
        :icon="statusCard.icon"
        :title="statusCard.title"
        :description="statusCard.message"
      />

      <!-- Form -->
      <template v-else-if="form">
        <div class="bg-card relative overflow-hidden rounded-2xl border shadow-sm">
          <BlurImage
            v-if="coverImage"
            :src="coverImage.src"
            :lqip="coverImage.lqip"
            :alt="form.title"
            image-class="aspect-[3/1] w-full object-cover"
          />
          <div class="p-6 sm:p-8">
            <!-- Header -->
            <div class="space-y-2">
              <h1 class="text-2xl font-semibold tracking-tighter text-balance sm:text-3xl">
                {{ form.title }}
              </h1>
              <div
                v-if="form.description"
                class="prose prose-sm text-muted-foreground max-w-none text-sm tracking-tight sm:text-base"
                v-html="form.description"
              />
            </div>

            <div class="bg-border my-6 h-px sm:my-8" />

            <form class="space-y-7" @submit.prevent="handleSubmit">
              <!-- General error -->
              <div
                v-if="formErrors._general"
                class="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm tracking-tight"
              >
                {{ formErrors._general }}
              </div>

              <!-- Honeypot: invisible to humans, bots tend to fill it -->
              <div
                class="absolute top-auto -left-[9999px] h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label for="hp_website">Website</label>
                <input
                  id="hp_website"
                  v-model="honeypotWebsite"
                  type="text"
                  name="website"
                  tabindex="-1"
                  autocomplete="off"
                />
              </div>

              <!-- Email field (if require_email) -->
              <div v-if="form.settings?.require_email" class="space-y-2">
                <Label for="respondent_email" class="text-sm sm:text-base">
                  {{ t("forms.emailLabel") }}
                  <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_email"
                  v-model="respondentEmail"
                  type="email"
                  placeholder="your@email.com"
                  :class="{ 'border-destructive': formErrors.respondent_email }"
                  @blur="checkDuplicate"
                />
                <p
                  v-if="formErrors.respondent_email"
                  class="text-destructive text-sm tracking-tight"
                >
                  {{ formErrors.respondent_email }}
                </p>
              </div>

              <!-- Dynamic fields -->
              <CustomFieldRenderer
                v-for="(field, index) in sortedFields"
                :key="field.ulid"
                :data-field-error="formErrors[`responses.${field.ulid}`] ? field.ulid : undefined"
                :field="field"
                :is-first="index === 0"
                :locale="locale"
                :model-value="responses[field.ulid]"
                :error="firstFieldError(field)"
                :upload-handler="uploadHandlers.uploadHandler"
                :revert-handler="uploadHandlers.revertHandler"
                @update:model-value="responses[field.ulid] = $event"
                @uploading="handleUploading"
              />

              <Button
                type="submit"
                :disabled="submitting || uploadsInProgress > 0"
                class="w-full"
                size="lg"
              >
                <Icon v-if="submitting" name="svg-spinners:180-ring" class="size-4 shrink-0" />
                <span>
                  {{
                    uploadsInProgress > 0
                      ? t("forms.uploadingFiles")
                      : submitting
                        ? t("forms.submitting")
                        : t("forms.submit")
                  }}
                </span>
              </Button>
            </form>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  CustomFieldRenderer,
  defaultValueFor,
  prefillValueFor as coercePrefill,
  supportsPrefill,
} from "../../components/ui/custom-field";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Result } from "../../components/ui/result";
import { Skeleton } from "../../components/ui/skeleton";
import { computed, nextTick, onMounted, ref, watch } from "vue";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t, locale } = useI18n();
const route = useRoute();
const event = useEvent();
const slug = computed(() => route.params.slug);

// Fetch the form definition (same-origin BFF proxy; X-API-Key injected server
// side). The SSR shell is identical per slug+locale - prefill + duplicate check
// happen client-side after mount - so this response is edge-cacheable.
const {
  data: formResponse,
  status,
  error: fetchError,
} = await useFetch(() => `/api/forms/${slug.value}`, {
  key: () => `form-${slug.value}-${locale.value}`,
  query: { locale },
  watch: [locale],
});

const form = computed(() => formResponse.value?.data || null);

// A missing/unavailable form (404) is a genuine not-found page, surfaced through
// the shared error.vue boundary. A 403 (form closed / not yet open / limit
// reached) is shown inline as a "closed" status card instead, using the
// staff-set closed_message the backend passes as data.message.
if (fetchError.value) {
  const code = fetchError.value.statusCode || fetchError.value.data?.statusCode;
  if (code !== 403) {
    throw createError({
      statusCode: code || 404,
      statusMessage: fetchError.value.data?.message || t("forms.notFoundMessage"),
      fatal: true,
    });
  }
}

const coverImage = computed(() => {
  const cover = form.value?.cover_image;
  if (!cover) return null;
  return {
    src: cover.xl || cover.lg || cover.md || cover.url,
    lqip: cover.lqip || "",
  };
});

const sortedFields = computed(() => {
  if (!form.value?.fields) return [];
  return [...form.value.fields].sort(
    (a, b) => (a.order_column || 0) - (b.order_column || 0)
  );
});

// A 403 GET response = form closed / not yet open / response limit reached.
const closedState = computed(() => {
  if (!fetchError.value) return null;
  const code = fetchError.value.statusCode || fetchError.value.data?.statusCode;
  if (code !== 403) return null;
  return { message: fetchError.value.data?.message || t("forms.closedMessage") };
});

// One shared Result for closed / success / already-submitted states.
const statusCard = computed(() => {
  // Closed is an error, but painted neutral on purpose: the form being shut is
  // not the visitor's fault, so it should not read as a failure they caused.
  if (closedState.value) {
    return {
      status: "error",
      variant: "muted",
      icon: "lucide:alert-circle",
      title: t("forms.closedTitle"),
      message: closedState.value.message,
    };
  }
  // No icon here: success is the one state that draws its own checkmark.
  if (submitted.value) {
    return {
      status: "success",
      variant: "soft",
      icon: undefined,
      title: t("forms.successTitle"),
      message: successMessage.value || t("forms.successMessage"),
    };
  }
  if (alreadySubmitted.value && form.value) {
    return {
      status: "info",
      variant: "soft",
      icon: "lucide:check-circle-2",
      title: t("forms.alreadyTitle"),
      message: t("forms.alreadyMessage"),
    };
  }
  return null;
});

usePageMeta(null, {
  title: computed(() =>
    form.value?.title ? `${form.value.title} · ${event.title}` : event.title
  ),
});

// Embedded/standalone public forms should never be indexed.
useSeoMeta({ robots: "noindex, nofollow" });

// --- Form state ---
const responses = ref({});
const respondentEmail = ref("");
const formErrors = ref({});
const submitting = ref(false);
const submitted = ref(false);
const successMessage = ref("");
const alreadySubmitted = ref(false);
const duplicateCheckDone = ref(false);
const uploadsInProgress = ref(0);

const handleUploading = (active) => {
  uploadsInProgress.value = Math.max(0, uploadsInProgress.value + (active ? 1 : -1));
};

// Honeypot anti-spam: hidden field stays empty, token proves a human-paced fill.
const honeypotWebsite = ref("");
const honeypotToken = ref("");

const generateHoneypotToken = () => {
  const rand = () => Math.random().toString(16).slice(2, 10);
  return btoa(`${rand()}_${Math.floor(Date.now() / 1000)}_${rand()}`);
};

// Prefill a field from URL query params (?{ulid}=value or ?{param_key}=value).
const prefillValueFor = (field) => {
  if (!supportsPrefill(field.type)) return undefined;
  const raw =
    route.query[field.ulid] ??
    (field.settings?.param_key && route.query[field.settings.param_key]);
  return coercePrefill(field, raw);
};

// Initialize default values per field type once the form loads.
watch(
  sortedFields,
  (fields) => {
    for (const field of fields) {
      if (field.type !== "section" && responses.value[field.ulid] === undefined) {
        responses.value[field.ulid] = prefillValueFor(field) ?? defaultValueFor(field);
      }
    }
  },
  { immediate: true }
);

// First error for a field, including nested keys (date_range start/end, arrays).
const firstFieldError = (field) => {
  const prefix = `responses.${field.ulid}`;
  const exact = formErrors.value[prefix];
  if (exact) return exact;
  const nestedKey = Object.keys(formErrors.value).find((key) =>
    key.startsWith(`${prefix}.`)
  );
  return nestedKey ? formErrors.value[nestedKey] : null;
};

// --- File uploads (same-origin BFF proxy, XHR for progress) ---
const xhrUpload = (url, formData, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject({ data });
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });

const uploadHandlers = {
  uploadHandler: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await xhrUpload(
      `/api/forms/${slug.value}/upload`,
      formData,
      onProgress
    );
    return { folder: response.folder, name: file.name, size: file.size };
  },
  revertHandler: async (folder) => {
    await $fetch(`/api/forms/${slug.value}/upload`, { method: "DELETE", body: folder });
  },
};

// --- Browser fingerprint (optional; degrades to email-only dedup) ---
const visitorId = ref(null);
const fingerprintReady = ref(false);

// Loading: skeleton until form loaded AND (if enabled) duplicate check done.
const isLoading = computed(() => {
  if (status.value === "pending") return true;
  if (fetchError.value) return false;
  if (!form.value) return true;
  if (form.value?.settings?.prevent_duplicate && !duplicateCheckDone.value) return true;
  return false;
});

onMounted(async () => {
  honeypotToken.value = generateHoneypotToken();

  // FingerprintJS is dynamically imported client-side only (kept out of the
  // SSR/Worker bundle). Degrades to email-only duplicate prevention on failure.
  try {
    const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    visitorId.value = result.visitorId;
  } catch {
    visitorId.value = null;
  }
  fingerprintReady.value = true;

  await checkDuplicateOnLoad();
});

// The form data may resolve after onMounted; re-check once it is available.
watch(form, async (newForm) => {
  if (newForm && fingerprintReady.value && !alreadySubmitted.value) {
    await checkDuplicateOnLoad();
  }
});

const checkDuplicateOnLoad = async () => {
  if (!form.value?.settings?.prevent_duplicate) {
    duplicateCheckDone.value = true;
    return;
  }

  const by = form.value.settings.prevent_duplicate_by || "fingerprint";
  if ((by === "fingerprint" || by === "both") && !visitorId.value) {
    duplicateCheckDone.value = true;
    return;
  }

  try {
    const query = {};
    if (visitorId.value) query.fingerprint = visitorId.value;
    const result = await $fetch(`/api/forms/${slug.value}/check`, { query });
    if (result.already_submitted) {
      alreadySubmitted.value = true;
    }
  } catch {
    // Ignore check errors - never block the form on the dedup probe.
  } finally {
    duplicateCheckDone.value = true;
  }
};

const checkDuplicate = async () => {
  if (!form.value?.settings?.prevent_duplicate) return;

  const query = {};
  if (respondentEmail.value) query.email = respondentEmail.value;
  if (visitorId.value) query.fingerprint = visitorId.value;

  try {
    const result = await $fetch(`/api/forms/${slug.value}/check`, { query });
    if (result.already_submitted) {
      alreadySubmitted.value = true;
    }
  } catch {
    // Ignore check errors.
  }
};

watch(respondentEmail, (val) => {
  if (val && val.includes("@")) {
    checkDuplicate();
  }
});

// --- Submit ---
const handleSubmit = async () => {
  if (alreadySubmitted.value) return;

  submitting.value = true;
  formErrors.value = {};

  try {
    const body = {
      responses: responses.value,
      respondent_email: respondentEmail.value || null,
      browser_fingerprint: visitorId.value,
      website: honeypotWebsite.value,
      _token_time: honeypotToken.value,
    };

    const result = await $fetch(`/api/forms/${slug.value}/submit`, {
      method: "POST",
      body,
    });

    if (result.redirect_url) {
      window.location.href = result.redirect_url;
      return;
    }

    successMessage.value = result.message || t("forms.successMessage");
    submitted.value = true;
  } catch (err) {
    // Nitro wraps the upstream body one level deep (err.data.data), so probe
    // both shapes - same defensive pattern as the ticket checkout.
    const body = err?.data || {};
    const errors = body.errors || body.data?.errors;
    const statusCode =
      err?.statusCode || err?.status || body.statusCode || body.data?.statusCode;
    if (statusCode === 422 && errors) {
      const unmapped = [];
      Object.entries(errors).forEach(([key, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        if (key.startsWith("responses.") || key === "respondent_email") {
          formErrors.value[key] = msg;
        } else {
          unmapped.push(msg);
        }
      });
      if (unmapped.length) {
        formErrors.value._general = unmapped.join(". ");
      }
      scrollToFirstError();
    } else if (statusCode === 409) {
      alreadySubmitted.value = true;
    } else {
      formErrors.value._general =
        body.message || body.data?.message || t("forms.submitFailed");
    }
  } finally {
    submitting.value = false;
  }
};

const scrollToFirstError = async () => {
  await nextTick();
  const target =
    document.querySelector("[data-field-error]") || document.querySelector("form");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
};
</script>
