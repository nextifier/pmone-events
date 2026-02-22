<template>
  <div class="min-h-screen-offset grid place-items-center pt-6 pb-24 sm:pt-10">
    <div class="container">
      <div v-if="currentStep === 1" class="mx-auto max-w-xl">
        <h1
          class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl"
        >
          Random Winner Generator
        </h1>

        <div class="mt-10 grid gap-y-8">
          <div class="input-group">
            <label for="prize">Prize</label>
            <input id="prize" v-model="prize" class="input-base" />
          </div>

          <div class="input-group">
            <label for="names">Paste or type names, separated by lines.</label>
            <textarea
              id="names"
              v-model="rawNames"
              @paste="handleInput"
              class="input-base min-h-64 px-3 py-2 tracking-tight"
            ></textarea>
          </div>

          <button
            type="button"
            @click="handleInput"
            class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center gap-1 justify-self-end rounded-xl px-4 py-2 font-semibold tracking-tight transition active:scale-98"
          >
            <span>Next</span>
            <Icon name="lucide:arrow-right" class="size-4" />
          </button>
        </div>
      </div>

      <div v-if="currentStep === 2" class="grid gap-y-4">
        <button
          type="button"
          @click="currentStep = 1"
          class="hover:bg-muted flex items-center gap-x-1.5 justify-self-start rounded-xl px-3 py-2 text-sm tracking-tight transition active:scale-98"
        >
          <IconArrowLeft class="h-4" />
          <span>Back</span>
        </button>
        <h2
          class="text-primary text-center text-3xl font-semibold tracking-tighter"
        >
          <span
            >Nama-nama peserta yang berkesempatan mendapatkan doorprize
            <strong v-if="prize"> {{ prize }}</strong></span
          >
        </h2>

        <div
          class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <div
            v-for="(name, index) in cleanedNames"
            :key="index"
            class="bg-muted text-primary flex items-center justify-center overflow-hidden rounded-2xl px-4 py-4 text-center tracking-tight"
          >
            <span class="line-clamp-1">{{ name }}</span>
          </div>
        </div>

        <div class="fixed inset-x-0 bottom-4 container flex">
          <button
            @click="proceedToStep3"
            class="bg-primary text-primary-foreground flex w-full items-center justify-center gap-x-2 rounded-xl px-8 py-4 text-xl font-semibold tracking-tight transition hover:scale-105 active:scale-98"
          >
            <Icon name="lucide:sparkles" class="size-6" />
            <span>Spin to Win!</span>
          </button>
        </div>
      </div>

      <div v-if="currentStep === 3" class="relative isolate grid gap-4">
        <div
          ref="slotMachineContainer"
          class="slot-machine-container relative isolate h-[440px] w-full overflow-hidden rounded-3xl opacity-0"
        >
          <div
            ref="slotMachine"
            class="slot-machine-list relative z-10 flex flex-col"
          >
            <div
              v-for="(name, index) in cleanedNames"
              :key="index"
              class="slot-item flex h-24 items-center justify-center text-center text-2xl"
            >
              <span
                class="line-clamp-1 bg-linear-to-r from-black to-black bg-clip-text text-4xl leading-[1.2]! font-semibold tracking-tighter text-black text-transparent sm:text-7xl dark:from-white dark:to-gray-500"
              >
                {{ name }}
              </span>
            </div>
          </div>

          <transition name="fade">
            <div
              v-if="!isSpinning"
              class="absolute inset-x-0 top-1/2 z-30 mx-auto w-full max-w-xl translate-y-12"
            >
              <div
                class="absolute inset-x-0 top-0 mx-auto h-[2px] w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent blur-xs"
              />
              <div
                class="absolute inset-x-0 top-0 mx-auto h-px w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent"
              />
              <div
                class="absolute inset-x-10 top-0 mx-auto h-[5px] w-1/2 bg-linear-to-r from-transparent via-sky-500 to-transparent blur-xs"
              />
              <div
                class="absolute inset-x-10 top-0 mx-auto h-px w-1/2 bg-linear-to-r from-transparent via-sky-500 to-transparent"
              />
            </div>
          </transition>

          <div
            class="from-background/100 via-background/0 to-background/100 pointer-events-none absolute inset-0 top-0 z-20 bg-linear-to-b"
          ></div>

          <div
            class="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between"
          >
            <Icon
              name="mdi:guitar-pick"
              class="size-10 -rotate-90 text-blue-600 sm:size-16"
            />
            <Icon
              name="mdi:guitar-pick"
              class="size-10 rotate-90 text-blue-600 sm:size-16"
            />
          </div>
        </div>

        <div class="fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-xl px-4">
          <transition name="fade">
            <div v-if="!isSpinning" class="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                @click="pickAnotherWinner"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 text-xl font-semibold tracking-tight transition active:scale-98"
              >
                <Icon name="lucide:refresh-cw" class="size-6" />
                <span>Pick Another Winner</span>
              </button>

              <button
                type="button"
                @click="resetGame"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-xl font-semibold tracking-tight text-white transition hover:bg-blue-700 active:scale-98"
              >
                <Icon name="lucide:check" class="size-6" />
                <span>Finish</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <transition name="fade">
      <button
        v-show="isScrollButtonVisible"
        @click="scrollToTop"
        aria-label="Scroll to top"
        v-tippy="'Scroll to top'"
        class="bg-muted text-primary xs:right-4 fixed right-3 bottom-8 z-50 size-14 rounded-full sm:right-6 sm:bottom-5 lg:bottom-12 xl:right-12"
      >
        <Icon name="hugeicons:arrow-up-double" class="size-4" />
      </button>
    </transition>
  </div>
</template>

<script setup>
usePageMeta("winner");

import { gsap } from "gsap";
import confetti from "canvas-confetti";
import { toast } from "vue-sonner";

const currentStep = ref(1);
const rawNames = ref("");
const prize = ref("");
const cleanedNames = ref([]);
const slotMachineContainer = ref(null);
const slotMachine = ref(null);
const winnerName = ref("");
const isSpinning = ref(false);

const spinningSound = process.client ? new Audio("/sfx/drum-roll.mp3") : null;
const completionSound = process.client ? new Audio("/sfx/completed.mp3") : null;

function cleanNames(input) {
  const names = new Set(); // Use a Set to automatically deduplicate
  input.split("\n").forEach((name) => {
    name = name
      .trim()
      .replace(/[^a-zA-Z\s]/g, "")
      .toLowerCase();
    if (name.length > 0) {
      names.add(name.replace(/\b\w/g, (match) => match.toUpperCase()));
    }
  });
  return Array.from(names); // Convert Set back to an array
}

function handleInput() {
  setTimeout(() => {
    cleanedNames.value = cleanNames(rawNames.value);
    if (cleanedNames.value.length) {
      currentStep.value = 2;
    }
  }, 0);
}

function proceedToStep3() {
  currentStep.value = 3;
  isSpinning.value = true;

  nextTick(() => {
    if (!slotMachineContainer.value || !slotMachine.value) {
      console.error("Slot machine elements not found!");
      return;
    }

    const targetLength = 1000;
    const duplicationFactor = Math.ceil(
      targetLength / cleanedNames.value.length,
    );
    cleanedNames.value = Array(duplicationFactor)
      .fill([...new Set(cleanedNames.value)])
      .flat();

    spinSlotMachine();
  });
}

function triggerRealisticConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

function spinSlotMachine() {
  if (!cleanedNames.value.length) return;

  const randomIndex = Math.floor(Math.random() * cleanedNames.value.length);
  winnerName.value = cleanedNames.value[randomIndex];

  const itemHeight = 96; // Fixed height of each slot item
  const containerHeight = 440; // Fixed height of the container (96 * 4rem)
  const yPosition =
    -(randomIndex * itemHeight) + (containerHeight / 2 - itemHeight / 2);

  spinningSound.play();

  const timeline = gsap.timeline();

  timeline.to(slotMachineContainer.value, {
    autoAlpha: 1,
    duration: 2,
  });

  timeline.to(
    slotMachine.value,
    {
      y: yPosition,
      duration: 6,
      ease: "power4.out",
      onComplete: () => {
        isSpinning.value = false;
        spinningSound.pause();
        spinningSound.currentTime = 0;
        completionSound.play();
        triggerRealisticConfetti();
      },
    },
    "<",
  );
}

function pickAnotherWinner() {
  cleanedNames.value = [...new Set(cleanedNames.value)];
  cleanedNames.value = cleanedNames.value.filter(
    (name) => name !== winnerName.value,
  );
  if (cleanedNames.value.length) {
    proceedToStep3();
  } else {
    toast.error("No more names left!");
    resetGame();
  }
}

function resetGame() {
  currentStep.value = 1;
  rawNames.value = "";
  prize.value = "";
  cleanedNames.value = [];
  winnerName.value = "";
  isSpinning.value = false;
}

function handleEscKey(event) {
  if (event.key === "Escape") {
    currentStep.value = 1;
  }
}

const isScrollButtonVisible = ref(false);

function handleScroll() {
  isScrollButtonVisible.value = window.scrollY > 200;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
  window.removeEventListener("scroll", handleScroll);
});
</script>
