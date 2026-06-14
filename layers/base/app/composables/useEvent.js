/**
 * Active event for the current website, sourced from PM One
 * (`/api/event/active` -> EventResource) instead of hardcoded app.config.
 *
 * Returns a reactive object shaped like the legacy `app.config.event` so
 * existing consumers keep accessing `event.title`, `event.edition.value`,
 * `event.startTime`, `event.inConjunction.list`, etc. unchanged. The fetch is
 * SSR-shared by key, so every component that calls this resolves the same data.
 */

const TZ = "Asia/Jakarta";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function jakarta(date, opts) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(date);
}

function dayNum(date) {
  return jakarta(date, { day: "numeric" });
}

function timeLabel(date) {
  const minute = jakarta(date, { minute: "2-digit" });
  const opts = { hour: "numeric", hour12: true };
  if (minute !== "00") opts.minute = "2-digit";
  return jakarta(date, opts);
}

export function useEvent() {
  const { data } = useFetch("/api/event/active", {
    key: "active-event",
    server: true,
    default: () => null,
  });

  const ev = () => data.value?.data ?? null;

  return reactive({
    get _raw() {
      return ev();
    },
    get id() {
      return ev()?.id ?? null;
    },
    get title() {
      return ev()?.title ?? "";
    },
    get edition() {
      const e = ev();
      const value = e?.edition_number ?? "";
      const full = e?.edition_number_with_ordinal ?? "";
      const ordinal =
        value !== "" && full ? String(full).replace(String(value), "") : "";
      return { value, ordinal };
    },
    get poster() {
      const p = ev()?.poster_image;
      return p?.xl || p?.lg || p?.md || p?.url || "";
    },
    get posterImage() {
      return ev()?.poster_image ?? null;
    },
    get profileImage() {
      return ev()?.profile_image ?? null;
    },
    get status() {
      return ev()?.status ?? "";
    },
    get startTime() {
      return ev()?.start_date ?? "";
    },
    get endTime() {
      return ev()?.end_date ?? "";
    },
    get date() {
      const e = ev();
      const start = toDate(e?.start_date);
      if (!start) return e?.date_label ?? "";
      const end = toDate(e?.end_date) ?? start;
      const sameMonth =
        jakarta(start, { month: "short", year: "numeric" }) ===
        jakarta(end, { month: "short", year: "numeric" });
      if (!sameMonth) return e?.date_label ?? "";
      const month = jakarta(start, { month: "short" });
      const sd = dayNum(start);
      const edn = dayNum(end);
      const days = sd === edn ? sd : `${sd}-${edn}`;
      return `${month} ${days}, ${jakarta(start, { year: "numeric" })}`;
    },
    get dateOnly() {
      const start = toDate(ev()?.start_date);
      if (!start) return "";
      const end = toDate(ev()?.end_date) ?? start;
      const sd = dayNum(start);
      const edn = dayNum(end);
      return sd === edn ? sd : `${sd}-${edn}`;
    },
    get month() {
      const start = toDate(ev()?.start_date);
      return start ? jakarta(start, { month: "long" }) : "";
    },
    get year() {
      const start = toDate(ev()?.start_date);
      return start ? jakarta(start, { year: "numeric" }) : "";
    },
    get time() {
      const start = toDate(ev()?.start_date);
      if (!start) return "";
      const end = toDate(ev()?.end_date);
      return end ? `${timeLabel(start)} - ${timeLabel(end)}` : timeLabel(start);
    },
    get location() {
      return ev()?.location ?? "";
    },
    get locationShort() {
      const e = ev();
      return e?.location_short || e?.location || "";
    },
    get locationLink() {
      return ev()?.location_link ?? "";
    },
    get hall() {
      return ev()?.hall ?? "";
    },
    get teaserVideoId() {
      return ev()?.teaser_video_id ?? "";
    },
    get description() {
      return ev()?.description ?? "";
    },
    get inConjunction() {
      const list = (ev()?.conjunction_events ?? []).map((c) => ({
        name: c.name || c.title,
        projectUsername: c.username || "",
        url: c.website_url || "",
        img: c.profile_image ?? null,
      }));
      return { label: "In conjunction with", list };
    },
  });
}
