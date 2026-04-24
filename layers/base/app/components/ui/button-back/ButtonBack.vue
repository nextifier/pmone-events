<template>
  <slot :goBack="goBack">
    <button
      @click="goBack"
      :class="cn(buttonBackVariants({ variant }), props.class)"
    >
      <Icon name="lucide:arrow-left" class="size-4 shrink-0" />
      <span
        v-if="showLabel"
        :class="
          variant === 'bordered' || variant === 'semiTransparent'
            ? 'hidden text-sm tracking-tight sm:block'
            : ''
        "
        >Back</span
      >
      <KbdGroup v-if="showLabel && shortcutEnabled && variant === 'default'">
        <Kbd>B</Kbd>
      </KbdGroup>
    </button>
  </slot>
</template>

<script setup>
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonBackVariants = cva(
  "flex items-center justify-center gap-x-1 transition active:scale-98",
  {
    variants: {
      variant: {
        default:
          "text-primary/80 hover:text-primary text-sm tracking-tight",
        bordered:
          "text-primary bg-background border-border lg:hover:bg-muted rounded-full border p-3 lg:border-0",
        semiTransparent:
          "text-primary bg-background/70 rounded-full border border-white/10 p-3 shadow-lg backdrop-blur-sm lg:hover:bg-background/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const props = defineProps({
  destination: {
    type: String,
    default: null,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  forceDestination: {
    type: Boolean,
    default: false,
  },
  shortcut: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: "default",
    validator: (v) => ["default", "bordered", "semiTransparent"].includes(v),
  },
  class: {
    type: [String, Array, Object],
    default: "",
  },
});

const router = useRouter();
const route = useRoute();

const shortcutEnabled = computed(() => {
  return (
    props.shortcut && !/\/posts\/(create|[^/]+\/edit)/.test(route.path)
  );
});

defineShortcuts({
  b: {
    handler: () => goBack(),
    whenever: [shortcutEnabled],
  },
});

const fallbackDestination = computed(() => {
  if (props.destination) {
    return props.destination;
  }
  const pathSegments = route.path.split("/").filter((p) => p);
  if (pathSegments.length <= 1) {
    return "/";
  }
  pathSegments.pop();
  return "/" + pathSegments.join("/");
});

const goBack = () => {
  if (props.forceDestination) {
    router.push(fallbackDestination.value);
    return;
  }
  if (window?.history?.length > 2) {
    router.back();
  } else {
    router.push(fallbackDestination.value);
  }
};
</script>
