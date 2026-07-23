<template>
  <!--
    The 41.8 KB logo SVG used to be inlined here — and because the header and
    footer both render it, every SSR page carried ~82 KB of duplicated logo
    markup. The artwork uses fixed fills only (white/black/#FEF205 — no
    currentColor, no fill-* classes), so an <img> is pixel-identical, cached by
    the browser and the edge, and shrinks every cached HTML entry.

    No default sizing class on purpose: callers pass their own (h-full, h-8…),
    exactly as they did to the old inline <svg>, and the width/height attrs
    give the browser the intrinsic 110x32 ratio.
  -->
  <img src="/img/logo-icc.svg" alt="Indonesia Comic Con" width="110" height="32" />
</template>
