<template>
  <!-- Fixed-fill artwork (no currentColor / fill-* classes) — served as a
       static file instead of ~5 KB inlined into every SSR response. Callers
       keep passing their own sizing classes, as with the old inline svg. -->
  <img src="/img/logo-mark.svg" alt="Franchise & License Expo Indonesia" width="142" height="143" />
</template>
