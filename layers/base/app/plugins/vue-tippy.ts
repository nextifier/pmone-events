import VueTippy from "vue-tippy";
import type { TippyPluginOptions } from "vue-tippy";

// Only "shift-away" is actually used (see defaultProps.animation below). The
// other three animation stylesheets were render-blocking dead weight.
import "tippy.js/animations/shift-away.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    component: "Tippy",
    directive: "tippy",
    defaultProps: {
      animation: "shift-away",
      delay: [200, 100],
      trigger: "mouseenter",
      touch: ["hold", 500],
      arrow: false,
    },
  } satisfies TippyPluginOptions);
});
