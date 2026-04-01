export default defineNuxtPlugin((nuxtApp) => {
  const pixelId = useAppConfig().settings.tiktokPixelId;
  if (!pixelId) return;

  const w = window;
  const d = document;
  const t = "ttq";

  w.TiktokAnalyticsObject = t;
  const ttq = (w[t] = w[t] || []);
  ttq.methods = [
    "page", "track", "identify", "instances", "debug",
    "on", "off", "once", "ready", "alias", "group",
    "enableCookie", "disableCookie", "holdConsent",
    "revokeConsent", "grantConsent",
  ];
  ttq.setAndDefer = function (t, e) {
    t[e] = function () {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.instance = function (t) {
    const e = ttq._i[t] || [];
    for (let n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n]);
    }
    return e;
  };
  ttq.load = function (e, n) {
    const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    const s = d.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = r + "?sdkid=" + e + "&lib=" + t;
    const first = d.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(s, first);
  };

  ttq.load(pixelId);
  ttq.page();

  nuxtApp.hook("page:finish", () => {
    ttq.page();
  });
});
