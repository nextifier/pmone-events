<template>
  <div
    v-if="model"
    v-tippy="tippyContent"
    class="@container relative shrink-0"
    :class="[
      gradientFrame
        ? `${effectiveRounded} before:gradient-insta before:absolute before:-inset-[max(0.25rem,4cqw)] before:rounded-[calc(var(--avatar-r)+max(0.25rem,4cqw))] before:bg-linear-to-tr before:content-[''] before:[corner-shape:inherit]`
        : '',
    ]"
    :style="gradientFrame ? { '--avatar-r': radiusValue } : undefined"
  >
    <div
      :style="fallbackStyle"
      :class="[
        '@container relative flex aspect-square shrink-0 items-center justify-center text-center',
        fallbackVariant === 'gel' ? '' : 'outline-inside',
        !model?.profile_image && (!effectiveColorful || gradientFrame) ? 'bg-muted' : '',
        gradientFrame ? 'ring-background bg-background z-10 ring-2' : '',
        effectiveRounded,
      ]"
    >
      <template v-if="gelLayers">
        <span
          aria-hidden="true"
          class="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0.8cqw_0.8cqw_oklch(1_0_0/0.25)] [corner-shape:inherit] dark:shadow-[inset_0_0_0.8cqw_0.8cqw_oklch(1_0_0/0.1)]"
          :style="gelLayers.fill"
        />
        <span
          aria-hidden="true"
          class="absolute inset-0 rounded-[inherit] opacity-95 [corner-shape:inherit] dark:opacity-40"
          :style="gelLayers.rim"
        />
      </template>
      <img
        v-if="model?.profile_image"
        :src="model.profile_image[size] || model.profile_image.sm"
        :alt="model?.name"
        :class="['size-full object-contain select-none', effectiveRounded]"
        width="100"
        height="100"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <span
        v-else
        :class="['initial relative text-[45cqw] tracking-tight select-none', initialsClass]"
      >
        {{
          (() => {
            const names = model?.name?.split(" ") || [];
            const first = names[0]?.[0]?.toUpperCase() || "";
            const last =
              names.length === 1
                ? names[0]?.[1]?.toUpperCase() || ""
                : names[names.length - 1]?.[0]?.toUpperCase() || "";
            return first + last;
          })()
        }}
      </span>

      <span
        v-if="indicator"
        :class="[
          'ring-background absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2',
          indicatorClass,
        ]"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { AVATAR_VARIANTS, avatarGelLayers, avatarHue, avatarMeshGradient } from "./colors";

const props = defineProps({
  model: Object,
  indicator: {
    type: String,
    default: null,
    validator: (v) =>
      v === null || ["success", "info", "warning", "destructive", "primary"].includes(v),
  },
  size: {
    type: String,
    default: "sm",
  },
  rounded: {
    type: String,
    default: "rounded-lg",
  },
  colorful: {
    type: Boolean,
    default: true,
  },
  /** Look of the initials fallback: "mesh" (the default) or "gel". */
  variant: {
    type: String,
    default: "mesh",
    validator: (v) => AVATAR_VARIANTS.includes(v),
  },
  /** Pins the fallback hue (0-359) instead of deriving it from the name. */
  hue: {
    type: Number,
    default: null,
  },
  gradientFrame: {
    type: Boolean,
    default: false,
  },
  circle: {
    type: Boolean,
    default: false,
  },
  noTooltip: {
    type: Boolean,
    default: false,
  },
});

const avatarGroupContext = inject("avatarGroupContext", null);

const indicatorClass = computed(() => {
  const map = {
    primary: "bg-primary",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };
  return map[props.indicator] || "";
});

const effectiveColorful = computed(() =>
  avatarGroupContext && avatarGroupContext.colorful !== undefined
    ? avatarGroupContext.colorful
    : props.colorful
);

const effectiveVariant = computed(() => avatarGroupContext?.variant ?? props.variant);

const effectiveRounded = computed(() => {
  if (props.circle || avatarGroupContext?.circle) return "rounded-full";
  return props.rounded;
});

const tippyContent = computed(() => {
  if (props.noTooltip) return "";
  if (avatarGroupContext?.showTooltip && props.model?.name) {
    return props.model.name;
  }
  return "";
});

const radiusValue = computed(() => {
  const value = effectiveRounded.value;
  if (value === "squircle" || value === "rounded-full") return "9999px";
  const suffix = value.replace("rounded", "");
  return `var(--radius${suffix})`;
});

/** The variant painting the fallback, or null when an image, a frame or `colorful=false` wins. */
const fallbackVariant = computed(() =>
  !props.model?.profile_image && effectiveColorful.value && !props.gradientFrame
    ? effectiveVariant.value
    : null
);

const hue = computed(() => props.hue ?? avatarHue(props.model?.name || ""));

const fallbackStyle = computed(() =>
  fallbackVariant.value === "mesh" ? { background: avatarMeshGradient(hue.value) } : undefined
);

const gelLayers = computed(() =>
  fallbackVariant.value === "gel" ? avatarGelLayers(hue.value) : null
);

/** Initials on a coloured fallback are always white; colors.ts darkens tiles that need it. */
const initialsClass = computed(() => {
  if (!effectiveColorful.value || props.gradientFrame) return "text-muted-foreground font-light";
  return "font-medium text-[oklch(1_0_0)]";
});
</script>
