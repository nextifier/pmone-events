<template>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -left-[5%] -top-[10%] w-[70%] h-[70%]">
      <KVGlassSlab :palette="palette" :angle="angle" :bars="6" fill :seed="seed" />
    </div>
    <div class="absolute -right-[5%] -bottom-[10%] w-[70%] h-[70%]">
      <KVGlassSlab
        :palette="palette"
        :angle="angle"
        :bars="6"
        fill
        :seed="seed + 1"
        :hue-shift="2"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  palette: {
    type: String,
    default: "aurora",
    validator: (v) => ["magenta", "aurora", "sunset"].includes(v),
  },
  angle: { type: Number, default: -28 },
  seed: { type: Number, default: 0 },
});
</script>
