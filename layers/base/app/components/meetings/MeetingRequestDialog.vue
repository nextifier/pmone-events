<!--
  The one detour a visitor the site does not know yet takes: their ticket email
  and a six-digit code, in this same tab (a link would open another browser and
  lose the page). The request leaves the moment the code checks out, so the
  time and note picked on the page are all it takes; the site remembers the
  visitor for the next exhibitor. A visitor without a ticket is told so
  plainly, with the way to get one; the chosen time is kept for after checkout.
-->
<template>
  <ResponsiveDialog
    v-model:open="openModel"
    dialog-max-width="440px"
    :title="$t('meetings.request.title')"
    :prevent-close="busy"
    virtual-keyboard
  >
    <div class="space-y-5 px-4 pt-5 pb-8 md:px-6 md:py-5">
      <!-- Step: email -->
      <template v-if="step === 'email'">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.title") }}</h2>
          <p class="text-muted-foreground text-sm tracking-tight">{{ $t("meetings.signIn.body") }}</p>
        </div>
        <form class="space-y-4" @submit.prevent="submitEmail">
          <div class="space-y-2">
            <Label for="meeting-email">{{ $t("meetings.signIn.emailLabel") }}</Label>
            <Input
              id="meeting-email"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              :placeholder="$t('meetings.signIn.emailPlaceholder')"
            />
            <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">{{ $t("meetings.signIn.emailHelp") }}</p>
          </div>
          <p v-if="error" class="text-destructive-foreground text-sm tracking-tight" role="alert">{{ error }}</p>
          <div class="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" @click="openModel = false">{{ $t("meetings.common.back") }}</Button>
            <Button type="submit" :loading="busy" :disabled="!validEmail">{{ $t("meetings.signIn.continue") }}</Button>
          </div>
        </form>
      </template>

      <!-- Step: code -->
      <template v-else-if="step === 'code'">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.codeTitle") }}</h2>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ $t("meetings.signIn.codeBody", { email: maskedEmail }) }}
          </p>
        </div>
        <div class="flex justify-center">
          <InputOTP
            v-model="code"
            :maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            :disabled="busy"
            @complete="submitCode"
          >
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 6" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p v-if="error" class="text-destructive-foreground text-center text-sm tracking-tight" role="alert">{{ error }}</p>
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm tracking-tight">
          <Button variant="link" size="sm" class="h-auto p-0" @click="changeEmail">{{ $t("meetings.signIn.wrongEmail") }}</Button>
          <Button v-if="resendIn <= 0" variant="link" size="sm" class="h-auto p-0" :disabled="busy" @click="resend">
            {{ $t("meetings.signIn.resend") }}
          </Button>
          <span v-else class="text-muted-foreground tabular-nums">{{ $t("meetings.signIn.resendIn", { time: resendLabel }) }}</span>
        </div>
      </template>

      <!-- Step: no ticket for this email -->
      <template v-else-if="step === 'no_ticket'">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.noTicketTitle") }}</h2>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ $t("meetings.signIn.noTicketBody", { email, event: eventTitle }) }}
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" @click="changeEmail">{{ $t("meetings.signIn.tryAnother") }}</Button>
          <Button @click="goGetTicket">{{ $t("meetings.signIn.getTicket") }}</Button>
        </div>
      </template>

      <!-- Step: ticket without meetings -->
      <template v-else-if="step === 'not_eligible'">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.notEligibleTitle") }}</h2>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ $t("meetings.errors.TICKET_NOT_ELIGIBLE", { ticket: ticketTitle }) }}
            {{ $t("meetings.signIn.notEligibleBody") }}
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" @click="openModel = false">{{ $t("meetings.common.back") }}</Button>
          <Button @click="goGetTicket">{{ $t("meetings.signIn.seeTickets") }}</Button>
        </div>
      </template>

    </div>
  </ResponsiveDialog>
</template>

<script setup>
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";
import ResponsiveDialog from "../ui/responsive-dialog/ResponsiveDialog.vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
  eventTitle: { type: String, default: "" },
  brandName: { type: String, default: "" },
  brandSlug: { type: String, default: "" },
  slotKey: { type: String, default: null },
  /** Sends the request the page holds; called once the visitor is known. */
  submit: { type: Function, required: true },
});
const emit = defineEmits(["signed-in", "sent", "failed"]);
const openModel = defineModel("open", { type: Boolean, default: false });

const { t } = useI18n();
const localePath = useLocalePath();
const { visitor, sendCode, verify } = useVisitorSession();
const intent = useMeetingIntent();

const step = ref("email");
const email = ref("");
const maskedEmail = ref("");
const code = ref("");
const busy = ref(false);
const error = ref(null);
const ticketTitle = ref("");
const resendIn = ref(0);
let timer = null;

const validEmail = computed(() => /.+@.+\..+/.test(email.value.trim()));
const resendLabel = computed(() => `0:${String(resendIn.value).padStart(2, "0")}`);
function stepForVisitor() {
  const status = visitor.value?.eligibility?.status;
  if (!visitor.value) return "email";
  if (status === "no_ticket") return "no_ticket";
  if (status === "ticket_not_eligible") {
    ticketTitle.value = visitor.value.eligibility.ticket || "";
    return "not_eligible";
  }
  return "send";
}

watch(openModel, (open) => {
  if (!open) return;
  error.value = null;
  code.value = "";
  step.value = stepForVisitor();
  if (visitor.value?.email) email.value = visitor.value.email;
  if (step.value === "send") send();
});

function startCountdown(seconds) {
  resendIn.value = seconds;
  clearInterval(timer);
  timer = setInterval(() => {
    resendIn.value -= 1;
    if (resendIn.value <= 0) clearInterval(timer);
  }, 1000);
}

onBeforeUnmount(() => clearInterval(timer));

function apiError(err) {
  const data = err?.data?.data ?? err?.data ?? {};
  const codeName = data.error_code;
  if (codeName === "CODE_INVALID") {
    return t("meetings.signIn.codeInvalid", { count: data.context?.attempts_left ?? 0 });
  }
  if (codeName === "CODE_EXPIRED") return t("meetings.signIn.codeExpired");
  if (codeName === "TOO_MANY_REQUESTS") return t("meetings.signIn.tooMany");
  if (codeName === "LINK_INVALID") return t("meetings.signIn.linkInvalid");
  return meetingErrorText({ data }, t);
}

async function submitEmail() {
  if (!validEmail.value) return;
  busy.value = true;
  error.value = null;
  try {
    const res = await sendCode(props.eventSlug, email.value.trim());
    if (res?.status === "code_sent") {
      maskedEmail.value = res.email;
      step.value = "code";
      startCountdown(res.resend_in ?? 60);
    } else if (res?.status === "ticket_not_eligible") {
      ticketTitle.value = res.ticket || "";
      step.value = "not_eligible";
    } else {
      step.value = "no_ticket";
    }
  } catch (err) {
    error.value = apiError(err);
  } finally {
    busy.value = false;
  }
}

async function resend() {
  code.value = "";
  await submitEmail();
}

async function submitCode(value) {
  const entered = String(value ?? code.value);
  if (entered.length !== 6 || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    await verify(props.eventSlug, email.value.trim(), entered);
    emit("signed-in");
    step.value = stepForVisitor();
  } catch (err) {
    error.value = apiError(err);
    code.value = "";
    busy.value = false;
    return;
  }
  if (step.value === "send") await send();
  busy.value = false;
}

function changeEmail() {
  step.value = "email";
  code.value = "";
  error.value = null;
}

function goGetTicket() {
  intent.save({
    event_slug: props.eventSlug,
    brand_slug: props.brandSlug,
    brand_name: props.brandName,
    slot: props.slotKey,
  });
  openModel.value = false;
  navigateTo(localePath("/tickets"));
}

async function send() {
  try {
    const res = await props.submit();
    openModel.value = false;
    emit("sent", res?.data ?? null);
  } catch (err) {
    openModel.value = false;
    emit("failed", err);
  }
}
</script>
