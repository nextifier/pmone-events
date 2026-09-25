<!--
  Sign in on the event website with the ticket email and a six-digit code.
  Used where there is no time picked yet (the "My meetings" page).
-->
<template>
  <div class="border-border space-y-5 rounded-xl border p-4 sm:p-6">
    <template v-if="step === 'email'">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.title") }}</h2>
        <p class="text-muted-foreground text-sm tracking-tight">{{ $t("meetings.signIn.bodyMine") }}</p>
      </div>
      <form class="space-y-4" @submit.prevent="submitEmail">
        <div class="space-y-2">
          <Label for="signin-email">{{ $t("meetings.signIn.emailLabel") }}</Label>
          <Input id="signin-email" v-model="email" type="email" inputmode="email" autocomplete="email" required :placeholder="$t('meetings.signIn.emailPlaceholder')" />
          <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">{{ $t("meetings.signIn.emailHelp") }}</p>
        </div>
        <p v-if="error" class="text-destructive-foreground text-sm tracking-tight" role="alert">{{ error }}</p>
        <Button type="submit" :loading="busy" :disabled="!validEmail">{{ $t("meetings.signIn.continue") }}</Button>
      </form>
    </template>

    <template v-else-if="step === 'code'">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold tracking-tighter">{{ $t("meetings.signIn.codeTitle") }}</h2>
        <p class="text-muted-foreground text-sm tracking-tight">{{ $t("meetings.signIn.codeBody", { email: masked }) }}</p>
      </div>
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
      <p v-if="error" class="text-destructive-foreground text-sm tracking-tight" role="alert">{{ error }}</p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tracking-tight">
        <Button variant="link" size="sm" class="h-auto p-0" @click="step = 'email'">{{ $t("meetings.signIn.wrongEmail") }}</Button>
        <Button v-if="resendIn <= 0" variant="link" size="sm" class="h-auto p-0" :disabled="busy" @click="submitEmail">
          {{ $t("meetings.signIn.resend") }}
        </Button>
        <span v-else class="text-muted-foreground tabular-nums">{{ $t("meetings.signIn.resendIn", { time: `0:${String(resendIn).padStart(2, "0")}` }) }}</span>
      </div>
    </template>

    <template v-else>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold tracking-tighter">
          {{ step === "no_ticket" ? $t("meetings.signIn.noTicketTitle") : $t("meetings.signIn.notEligibleTitle") }}
        </h2>
        <p class="text-muted-foreground text-sm tracking-tight">
          {{
            step === "no_ticket"
              ? $t("meetings.signIn.noTicketBody", { email, event: eventTitle })
              : `${$t("meetings.errors.TICKET_NOT_ELIGIBLE", { ticket: ticketTitle })} ${$t("meetings.signIn.notEligibleBody")}`
          }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="step = 'email'">{{ $t("meetings.signIn.tryAnother") }}</Button>
        <Button :to="localePath('/tickets')">{{ step === "no_ticket" ? $t("meetings.signIn.getTicket") : $t("meetings.signIn.seeTickets") }}</Button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
  eventTitle: { type: String, default: "" },
});
const emit = defineEmits(["signed-in"]);

const { t } = useI18n();
const localePath = useLocalePath();
const { sendCode, verify } = useVisitorSession();

const step = ref("email");
const email = ref("");
const masked = ref("");
const code = ref("");
const busy = ref(false);
const error = ref(null);
const ticketTitle = ref("");
const resendIn = ref(0);
let timer = null;

const validEmail = computed(() => /.+@.+\..+/.test(email.value.trim()));
onBeforeUnmount(() => clearInterval(timer));

function explain(err) {
  const data = err?.data?.data ?? err?.data ?? {};
  if (data.error_code === "CODE_INVALID") return t("meetings.signIn.codeInvalid", { count: data.context?.attempts_left ?? 0 });
  if (data.error_code === "CODE_EXPIRED") return t("meetings.signIn.codeExpired");
  if (data.error_code === "TOO_MANY_REQUESTS") return t("meetings.signIn.tooMany");
  return meetingErrorText({ data }, t);
}

async function submitEmail() {
  if (!validEmail.value) return;
  busy.value = true;
  error.value = null;
  try {
    const res = await sendCode(props.eventSlug, email.value.trim());
    if (res?.status === "code_sent") {
      masked.value = res.email;
      code.value = "";
      step.value = "code";
      resendIn.value = res.resend_in ?? 60;
      clearInterval(timer);
      timer = setInterval(() => {
        resendIn.value -= 1;
        if (resendIn.value <= 0) clearInterval(timer);
      }, 1000);
    } else if (res?.status === "ticket_not_eligible") {
      ticketTitle.value = res.ticket || "";
      step.value = "not_eligible";
    } else {
      step.value = "no_ticket";
    }
  } catch (err) {
    error.value = explain(err);
  } finally {
    busy.value = false;
  }
}

async function submitCode(value) {
  const entered = String(value ?? code.value);
  if (entered.length !== 6 || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    await verify(props.eventSlug, email.value.trim(), entered);
    emit("signed-in");
  } catch (err) {
    error.value = explain(err);
    code.value = "";
  } finally {
    busy.value = false;
  }
}
</script>
