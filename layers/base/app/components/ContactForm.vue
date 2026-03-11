<template>
  <div>
    <!-- Form State -->
    <template v-if="!isSubmitted">
      <!-- Header -->
      <h1
        class="text-primary text-3xl leading-[1.25]! font-medium tracking-tighter text-balance sm:text-4xl"
      >
        {{ titleText }}
      </h1>
      <p v-if="description" class="mt-2 tracking-tight sm:mt-3">
        {{ description }}
      </p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-8 grid gap-6">
        <!-- Dynamic Fields -->
        <template v-for="field in visibleFields" :key="field.name">
          <div class="input-group">
            <label :for="field.name">{{ field.label }}</label>

            <!-- Phone Input -->
            <PhoneInputField
              v-if="field.type === 'phone'"
              :id="field.name"
              v-model="formState[field.name]"
              :required="field.required"
            />

            <!-- Products Select (when productOptions is provided) -->
            <template
              v-else-if="field.name === 'products' && productOptions?.length"
            >
              <!-- Custom Input for "Other" -->
              <div v-if="showCustomProductInput" class="flex gap-2">
                <input
                  :id="field.name"
                  v-model="formState[field.name]"
                  type="text"
                  :name="field.name"
                  :placeholder="$t('ui.enterYourProductType')"
                  class="flex-1"
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground aspect-square shrink-0 rounded-full text-sm underline transition"
                  @click="switchToProductSelect"
                >
                  <Icon name="lucide:chevron-down" class="size-4 shrink-0" />
                </button>
              </div>

              <!-- Select Dropdown -->
              <Select
                v-else
                v-model="formState[field.name]"
                @update:model-value="handleProductSelect"
              >
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="$t('ui.selectAProduct')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="(item, index) in productOptions"
                      :key="index"
                      :value="item"
                    >
                      {{ item }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </template>

            <!-- Referral Source Select -->
            <template
              v-else-if="
                field.name === 'referralSource' && referralSourceOptions?.length
              "
            >
              <Select v-model="formState[field.name]">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="$t('ui.selectAnOption')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="(item, index) in referralSourceOptions"
                      :key="index"
                      :value="item.label"
                    >
                      <span class="flex items-center gap-2">
                        <Icon :name="item.icon" class="size-4.5 shrink-0" />
                        <span>{{ item.label }}</span>
                      </span>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </template>

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="field.name"
              v-model="formState[field.name]"
              :name="field.name"
              :placeholder="field.placeholder"
              :required="field.required"
              class="autogrow"
            />

            <!-- Default Input -->
            <input
              v-else
              :id="field.name"
              v-model="formState[field.name]"
              :type="field.type || 'text'"
              :name="field.name"
              :placeholder="field.placeholder"
              :required="field.required"
            />
          </div>
        </template>

        <!-- Honeypot Field (hidden from users, visible to bots) -->
        <div class="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="honeypot.website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <!-- Disclaimer -->
        <p class="text-muted-foreground text-sm tracking-tight">
          {{ disclaimerText }}
        </p>

        <!-- Submit Button -->
        <button
          type="submit"
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 justify-self-start rounded-xl px-4 py-3 text-sm font-semibold tracking-tight transition active:scale-98"
          :disabled="isLoading"
          v-ripple
        >
          <LoadingSpinner v-if="isLoading" class="border-background size-4" />
          <span>{{ submitLabelText }}</span>
        </button>
      </form>
    </template>

    <!-- Success State -->
    <template v-else>
      <div
        class="min-h-screen-offset -mt-16 flex flex-col items-center justify-center text-center"
      >
        <div
          class="bg-muted flex size-16 items-center justify-center rounded-full"
        >
          <Icon
            name="hugeicons:checkmark-circle-03"
            class="text-primary size-8"
          />
        </div>

        <h2
          class="text-primary mt-6 text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
        >
          {{ successTitleText }}
        </h2>
        <p class="mt-4">{{ successMessageText }}</p>

        <NuxtLink
          :to="localePath('/')"
          class="bg-primary text-primary-foreground mt-8 rounded-xl px-6 py-4 font-semibold tracking-tight"
          v-ripple
          @click="handleSuccessAction"
        >
          {{ successButtonText }}
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { toast } from "vue-sonner";

const { t } = useI18n();
const localePath = useLocalePath();

// Props with defaults
const props = defineProps({
  // Form configuration
  title: { type: String, default: null },
  description: { type: String, default: null },
  submitLabel: { type: String, default: null },
  subject: { type: String, default: null },

  // Custom field labels
  nameLabel: { type: String, default: null },
  brandNameLabel: { type: String, default: null },

  // Field visibility toggles
  showJobTitle: { type: Boolean, default: false },
  showBrandName: { type: Boolean, default: false },
  showProducts: { type: Boolean, default: false },
  showMessage: { type: Boolean, default: true },

  // Product options for select dropdown (if provided, renders Select instead of Input)
  productOptions: { type: Array, default: null },

  // Referral source options for select dropdown (how did you find out about this event?)
  showReferralSource: { type: Boolean, default: false },
  referralSourceOptions: {
    type: Array,
    default: () => [
      { label: "Instagram", icon: "hugeicons:instagram" },
      { label: "Facebook", icon: "hugeicons:facebook-01" },
      { label: "TikTok", icon: "hugeicons:tiktok" },
      { label: "Website / Google Search", icon: "hugeicons:globe-02" },
      {
        label: "WhatsApp (Broadcast / Personal)",
        icon: "hugeicons:whatsapp",
      },
      { label: "Email", icon: "hugeicons:mail-01" },
      {
        label: "Colleagues / Partners / References",
        icon: "hugeicons:user-group",
      },
      {
        label: "Previous events (participated/attended)",
        icon: "hugeicons:calendar-03",
      },
    ],
  },

  // Pre-filled message (hides message field if provided)
  prefilledMessage: { type: String, default: null },

  // Custom disclaimer
  disclaimer: { type: String, default: null },

  // Success state customization
  successTitle: { type: String, default: null },
  successMessage: { type: String, default: null },
  successButtonLabel: { type: String, default: null },
});

// Computed defaults using i18n
const titleText = computed(() => props.title || t('contact.title'));
const submitLabelText = computed(() => props.submitLabel || t('ui.sendMessage'));
const subjectText = computed(() => props.subject || t('contact.formTitle'));
const successTitleText = computed(() => props.successTitle || t('contact.successTitle'));
const successMessageText = computed(() => props.successMessage || t('contact.successMessage'));
const successButtonText = computed(() => props.successButtonLabel || t('contact.successButton'));

// Emits
const emit = defineEmits(["submit", "success", "error"]);

// External dependencies
const { gtag } = useGtag();
const config = useAppConfig();
const uiStore = useUiStore();

// State
const isLoading = ref(false);
const isSubmitted = ref(false);
const formState = reactive({});
const honeypot = reactive({
  website: "",
  tokenTime: "",
});
const showCustomProductInput = ref(false);

// All available fields definition
const allFields = computed(() => [
  { name: "name", label: props.nameLabel || t('contact.name'), type: "text", required: true },
  { name: "jobTitle", label: t('contact.jobTitle'), type: "text", required: false },
  { name: "brandName", label: props.brandNameLabel || t('contact.brandName'), type: "text", required: false },
  { name: "products", label: t('contact.products'), type: "text", required: false },
  { name: "email", label: t('contact.email'), type: "email", required: true },
  { name: "phone", label: t('contact.phone'), type: "phone", required: true },
  {
    name: "referralSource",
    label: t('contact.referralSource'),
    type: "select",
    required: false,
  },
  {
    name: "message",
    label: t('contact.message'),
    type: "textarea",
    placeholder: t('ui.leaveAMessage'),
    required: true,
  },
]);

// Computed: fields to include based on props
const fields = computed(() => {
  return allFields.value.filter((field) => {
    if (field.name === "jobTitle") return props.showJobTitle;
    if (field.name === "brandName") return props.showBrandName;
    if (field.name === "products") return props.showProducts;
    if (field.name === "referralSource") return props.showReferralSource;
    if (field.name === "message") return props.showMessage;
    return true; // name, email, phone always shown
  });
});

// Initialize form state and honeypot token on mount
onMounted(() => {
  // Initialize form fields
  fields.value.forEach((field) => {
    formState[field.name] = "";
  });

  // Generate honeypot timestamp token
  honeypot.tokenTime = generateTimestampToken();
});

// Computed: visible fields (respects prefilledMessage)
const visibleFields = computed(() => {
  return fields.value.filter((field) => {
    // Hide message field if prefilled message is provided
    if (field.name === "message" && props.prefilledMessage) {
      return false;
    }
    return true;
  });
});

const disclaimerText = computed(() => {
  if (props.disclaimer) return props.disclaimer;
  if (props.title === "Exhibitor Registration" || props.subject === "Exhibitor Registration") {
    return t('contact.disclaimerExhibitor');
  }
  return t('contact.disclaimerDefault');
});

// Methods
function generateTimestampToken() {
  const timestamp = Math.floor(Date.now() / 1000);
  const random1 = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 10);
  return btoa(`${random1}_${timestamp}_${random2}`);
}

function buildFormData() {
  const data = {};

  fields.value.forEach((field) => {
    const value = formState[field.name];
    if (value) {
      // Convert camelCase to snake_case for API
      const apiKey =
        field.apiKey || field.name.replace(/([A-Z])/g, "_$1").toLowerCase();
      data[apiKey] = value;
    }
  });

  // Add prefilled message if provided
  if (props.prefilledMessage) {
    data.message = props.prefilledMessage;
  }

  return data;
}

function resetForm() {
  Object.keys(formState).forEach((key) => {
    formState[key] = "";
  });
  honeypot.website = "";
  honeypot.tokenTime = generateTimestampToken();
  showCustomProductInput.value = false;
}

async function handleSubmit() {
  isLoading.value = true;
  emit("submit", formState);

  try {
    const formData = buildFormData();
    const subject = subjectText.value;

    const result = await $fetch("/api/contact/submit", {
      method: "POST",
      body: {
        project_username: useAppConfig().app.projectUsername,
        subject,
        data: formData,
        // Honeypot fields
        website: honeypot.website,
        _token_time: honeypot.tokenTime,
      },
    });

    if (result.success) {
      resetForm();
      gtag("event", "contact_form_submission", {
        form_title: props.title,
        project: useAppConfig().app.projectUsername,
      });
      isSubmitted.value = true;
      emit("success", result);
    } else {
      toast.error(
        result.message || t('contact.errorSend'),
      );
      emit("error", result);
    }
  } catch (error) {
    console.error("Contact form error:", error);
    const message =
      error?.data?.message || t('contact.errorNetwork');
    toast.error(message);
    emit("error", error);
  } finally {
    isLoading.value = false;
  }
}

function handleSuccessAction() {
  uiStore.closeInquiryDialog?.();
}

function handleProductSelect(value) {
  if (value === "Other") {
    formState.products = "";
    showCustomProductInput.value = true;
  }
}

function switchToProductSelect() {
  formState.products = "";
  showCustomProductInput.value = false;
}
</script>
