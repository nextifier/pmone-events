export function useTiktokEvent() {
  const appConfig = useAppConfig();
  const route = useRoute();

  const pixelIds = computed(() => {
    return ([] as string[]).concat(appConfig.settings.tiktokPixelId).filter(Boolean);
  });

  function getTtclid(): string {
    // Check persisted cookie first, then current URL query
    const ttclidCookie = useCookie("ttclid", { maxAge: 60 * 60 * 24 * 7 });
    const queryTtclid = (route.query.ttclid as string) || "";

    // Persist ttclid from URL to cookie so it survives navigation
    if (queryTtclid) {
      ttclidCookie.value = queryTtclid;
    }

    return ttclidCookie.value || "";
  }

  function getTtp(): string {
    const ttpCookie = useCookie("_ttp");
    return ttpCookie.value || "";
  }

  function generateEventId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  async function trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    userInfo?: { email?: string; phone?: string; external_id?: string },
  ) {
    const ids = pixelIds.value;
    if (!ids.length) return;

    const eventId = generateEventId();

    // Client-side pixel (fires to all loaded pixel IDs automatically)
    if (import.meta.client && (window as any).ttq) {
      try {
        (window as any).ttq.track(eventName, {
          ...properties,
          event_id: eventId,
        });
      } catch (e) {
        console.warn("[TikTok Pixel] Client track failed:", e);
      }
    }

    // Server-side Events API (send to each pixel ID)
    const payload = {
      event: eventName,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      url: import.meta.client ? window.location.href : "",
      referrer: import.meta.client ? document.referrer : "",
      user: {
        ttclid: getTtclid(),
        ttp: getTtp(),
        ...(userInfo || {}),
      },
      properties: properties || {},
    };

    for (const pixelCode of ids) {
      try {
        await $fetch("/api/tiktok/event", {
          method: "POST",
          body: { pixel_code: pixelCode, ...payload },
        });
      } catch (e) {
        console.warn(`[TikTok Events API] Server track failed for ${pixelCode}:`, e);
      }
    }
  }

  return { trackEvent };
}
