<template>
  <!--
    Overrides the base-layer Logo (9.4 KB inline currentColor SVG) with a CSS
    mask over a static file. Rendered by both the header and the footer, the
    inline version cost ~18 KB per SSR page. `background-color: currentColor`
    + mask reproduces the exact single-colour theming of fill="currentColor",
    and aspect-ratio matches the 900x143 viewBox so the caller's height-only
    classes keep driving the width, as they did with the inline svg.
  -->
  <span
    role="img"
    aria-label="Megabuild Indonesia"
    class="block"
    :style="{
      aspectRatio: '900 / 143',
      backgroundColor: 'currentColor',
      mask: 'url(/img/logo-megabuild.svg) no-repeat center / contain',
      WebkitMask: 'url(/img/logo-megabuild.svg) no-repeat center / contain',
    }"
  />
</template>
