<template>
  <Shader
    :disable-telemetry="true"
    color-space="srgb"
    class="block h-full w-full"
  >
    <!-- Base: brand magenta palette (amber → ember → magenta → violet → cobalt) -->
    <MultiPointGradient
      color-a="#FFB800"
      :position-a="{ x: 0, y: 0 }"
      color-b="#FF5A1F"
      :position-b="{ x: 0.25, y: 0.05 }"
      color-c="#FF1A8E"
      :position-c="{ x: 0.5, y: 0.4 }"
      color-d="#5C1FFF"
      :position-d="{ x: 0.78, y: 0.78 }"
      color-e="#0E29FF"
      :position-e="{ x: 1, y: 1 }"
      :smoothness="2.5"
    />

    <!-- Highlight bands: subtle white screen on diagonals -->
    <Stripes
      :angle="-22"
      :density="5"
      color-a="#000000"
      color-b="#FFFFFF"
      :softness="0.04"
      :speed="0.04"
      :opacity="0.22"
      blend-mode="screen"
    />

    <!-- Shadow bands: enhance depth between highlights -->
    <Stripes
      :angle="-22"
      :density="5"
      color-a="#FFFFFF"
      color-b="#000000"
      :softness="0.18"
      :speed="0.04"
      :offset="0.12"
      :opacity="0.18"
      blend-mode="multiply"
    />
  </Shader>
</template>

<script setup>
import { Shader, MultiPointGradient, Stripes } from "shaders/vue";
</script>
