<template>
  <!--
    The 19.4 KB currentColor logo SVG used to be inlined here (header + footer
    = ~38 KB per SSR page). CSS mask over a static file reproduces
    fill="currentColor" theming exactly; aspect-ratio mirrors the 1681x494
    viewBox so height-only classes keep sizing the width.
  -->
  <span
    role="img"
    aria-label="Renex"
    class="block"
    :style="{
      aspectRatio: '1681 / 494',
      backgroundColor: 'currentColor',
      mask: 'url(/img/logo-renex.svg) no-repeat center / contain',
      WebkitMask: 'url(/img/logo-renex.svg) no-repeat center / contain',
    }"
  />
</template>
