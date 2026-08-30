// Runtime core for the custom-field renderer, shared across every feature that
// renders dynamic fields (Form Builder, Business Matching, ticket registration,
// brand profile, ops-document mini-forms) and portable across the synced
// component libraries. No imports outside this folder.
//
// A "field" is the unified CustomField shape: { ulid, type, label, placeholder,
// help_text, options: [{value, label}], validation: {...}, settings: {...} }.
// Labels/options may arrive already-localized (string) or as a {locale: string}
// translation map (predefined-library fields); normalizeField resolves them.

/**
 * Hard ceiling for any custom-field file upload, in KB (20 MB). Mirrors the
 * real server limits (PHP post_max_size, TemporaryUploadController `max:20480`,
 * config/media-library) and the backend clamp in PublicFormService. A field's
 * configured max_file_size is clamped to this so the UI never promises more
 * than the server can actually accept.
 */
export const MAX_UPLOAD_SIZE_KB = 20480;

export type FieldLabel = string | Record<string, string> | null | undefined;

export interface FieldOption {
  value: string | number;
  label?: FieldLabel;
}

export interface CustomFieldShape {
  id?: number | string;
  ulid?: string;
  type: string;
  label?: FieldLabel;
  placeholder?: FieldLabel;
  help_text?: FieldLabel;
  options?: Array<FieldOption | string> | null;
  validation?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
  required?: boolean;
}

export interface NormalizedField {
  key: string;
  ulid?: string;
  id?: number | string;
  type: string;
  label: string;
  placeholder: string;
  help_text: string;
  options: Array<{ value: string; label: string }>;
  validation: Record<string, unknown>;
  settings: Record<string, unknown>;
}

interface TypeMeta {
  multiValue?: boolean;
  isLayout?: boolean;
  noPrefill?: boolean;
  hasOptions?: boolean;
}

export const TYPE_META: Record<string, TypeMeta> = {
  text: {},
  textarea: {},
  rich_text: {},
  email: {},
  phone: {},
  url: {},
  select: { hasOptions: true },
  multi_select: { hasOptions: true, multiValue: true },
  radio: { hasOptions: true },
  checkbox: {},
  checkbox_group: { hasOptions: true, multiValue: true },
  switch: {},
  tags: { multiValue: true },
  country: {},
  // Dependent location selects; `settings.depends_on` names the parent field.
  province: {},
  city: {},
  date: {},
  time: {},
  datetime: {},
  date_range: {},
  month: {},
  month_range: {},
  year: {},
  year_range: {},
  time_range: {},
  number: {},
  slider: {},
  slider_range: {},
  slider_ruler: {},
  price: {},
  price_range: {},
  rating: {},
  linear_scale: {},
  file: { noPrefill: true },
  color: {},
  section: { isLayout: true, noPrefill: true },
};

export const OPTION_TYPES = ["select", "multi_select", "checkbox_group", "radio"];
export const MULTI_VALUE_TYPES = ["multi_select", "checkbox_group", "tags"];
export const LAYOUT_TYPES = ["section"];

/**
 * Types whose logical value is a {start, end} object. They bypass the [value]
 * scalar storage wrapping and share the joined "start - end" display format.
 * Mirrors FormFieldTypes::OBJECT_RANGE_TYPES on the backend.
 */
export const OBJECT_RANGE_TYPES = [
  "date_range",
  "month_range",
  "year_range",
  "time_range",
  "slider_range",
  "price_range",
];

export const hasOptions = (type: string): boolean => Boolean(TYPE_META[type]?.hasOptions);
export const isInputType = (type: string): boolean => !TYPE_META[type]?.isLayout;
export const supportsPrefill = (type: string): boolean => !TYPE_META[type]?.noPrefill;
export const isMultiValue = (type: string): boolean => Boolean(TYPE_META[type]?.multiValue);

/**
 * Resolve a translatable value (string or {locale: string} map) to a string for
 * the requested locale, falling back to English then the first available value.
 */
export const localizedLabel = (label: FieldLabel, locale = "en"): string => {
  if (label == null) return "";
  if (typeof label === "string") return label;
  if (typeof label === "object") {
    const resolved = label[locale] ?? label.en ?? Object.values(label)[0];
    return resolved == null ? "" : String(resolved);
  }
  return String(label);
};

/**
 * Descending list of years for the "years" options preset (birth year, founded
 * year). Generated at render time so it never goes stale at year rollover.
 */
export const presetOptions = (preset: string): Array<{ value: string; label: string }> => {
  if (preset === "years") {
    const current = new Date().getFullYear();
    const years = [];
    for (let year = current; year >= 1900; year--) {
      years.push({ value: String(year), label: String(year) });
    }
    return years;
  }
  return [];
};

/**
 * Canonicalize an options list to [{value: string, label: string}] for a locale.
 * Tolerates plain-string arrays (legacy BM/brand shape), {value,label} pairs,
 * and {locale: string} label maps. When settings.options_preset is set, returns
 * the generated preset instead.
 */
export const normalizeOptions = (
  options: Array<FieldOption | string> | null | undefined,
  locale = "en",
  preset?: string,
): Array<{ value: string; label: string }> => {
  if (preset) return presetOptions(preset);

  return (options || [])
    .map((option) => {
      if (option && typeof option === "object") {
        if (option.value == null) return null;
        return {
          value: String(option.value),
          label: localizedLabel(option.label ?? String(option.value), locale) || String(option.value),
        };
      }
      return { value: String(option), label: String(option) };
    })
    .filter((option): option is { value: string; label: string } => option !== null);
};

/**
 * Formalizes the ad-hoc adapter every consumer used to hand-roll: unifies the
 * field key (ulid, falling back to id), the required flag (validation.required
 * or the legacy top-level required), options, and localized text. Also maps the
 * legacy brand `year_select` type onto select + the years preset.
 */
export const normalizeField = (field: CustomFieldShape, locale = "en"): NormalizedField => {
  let type = field.type;
  const settings = { ...(field.settings || {}) };

  if (type === "year_select") {
    type = "select";
    settings.options_preset = "years";
  }

  const validation = {
    ...(field.validation || {}),
    required: (field.validation?.required as boolean) ?? field.required ?? false,
  };

  return {
    key: field.ulid ?? String(field.id ?? ""),
    ulid: field.ulid,
    id: field.id,
    type,
    label: localizedLabel(field.label, locale),
    placeholder: localizedLabel(field.placeholder, locale),
    help_text: localizedLabel(field.help_text, locale),
    options: normalizeOptions(field.options, locale, settings.options_preset as string | undefined),
    validation,
    settings,
  };
};

export const defaultValueFor = (field: { type: string; settings?: Record<string, unknown> | null }) => {
  switch (field.type) {
    case "checkbox":
    case "switch":
      return false;
    case "multi_select":
    case "checkbox_group":
    case "tags":
      return [];
    case "file":
      return field.settings?.multiple ? [] : null;
    case "text":
    case "textarea":
    case "email":
    case "phone":
    case "url":
    case "rich_text":
      return "";
    default:
      return null;
  }
};

/**
 * Reverse the [value] scalar wrapping used by the row-per-answer stores
 * (business matching, ticket registration) so a stored answer seeds the
 * renderer as its logical value.
 */
export const normalizeStoredValue = (field: { type: string }, value: unknown) => {
  if (OBJECT_RANGE_TYPES.includes(field.type)) {
    return value && typeof value === "object" ? value : null;
  }
  if (MULTI_VALUE_TYPES.includes(field.type)) {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value as Record<string, unknown>).every((v) => v === null || v === "");
  }
  return false;
};

/**
 * Coerce a raw URL-query value into the correct shape for a field type (used to
 * prefill a public form from `?key=value`). Returns undefined when the raw
 * value cannot be applied.
 */
export const prefillValueFor = (field: CustomFieldShape, rawValue: unknown) => {
  if (!supportsPrefill(field.type)) return undefined;
  if (rawValue === undefined || rawValue === null || rawValue === false || rawValue === "") {
    return undefined;
  }

  const value = String(Array.isArray(rawValue) ? rawValue[0] : rawValue);
  const optionValues = normalizeOptions(field.options, "en", field.settings?.options_preset as string | undefined).map(
    (o) => o.value,
  );

  switch (field.type) {
    case "multi_select":
    case "checkbox_group": {
      const values = value.split(",").map((v) => v.trim()).filter(Boolean);
      const valid = values.filter((v) => optionValues.includes(v));
      return valid.length ? valid : undefined;
    }
    case "tags":
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    case "select":
    case "radio":
      return optionValues.includes(value) ? value : undefined;
    case "checkbox":
    case "switch":
      return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    case "number":
    case "slider":
    case "slider_ruler":
    case "price":
    case "year":
    case "rating":
    case "linear_scale": {
      const number = Number(value);
      return Number.isNaN(number) ? undefined : number;
    }
    case "month":
      return /^\d{4}-\d{2}$/.test(value) ? value : undefined;
    case "date_range": {
      const [start, end] = value.split(",").map((v) => v.trim());
      return start && end ? { start, end } : undefined;
    }
    case "month_range": {
      const [start, end] = value.split(",").map((v) => v.trim());
      const valid = (v?: string) => Boolean(v && /^\d{4}-\d{2}$/.test(v));
      return valid(start) && valid(end) ? { start, end } : undefined;
    }
    case "time_range": {
      const [start, end] = value.split(",").map((v) => v.trim());
      const valid = (v?: string) => Boolean(v && /^\d{1,2}:\d{2}$/.test(v));
      return valid(start) && valid(end) ? { start, end } : undefined;
    }
    case "year_range":
    case "slider_range":
    case "price_range": {
      const [start, end] = value.split(",").map((v) => Number(v.trim()));
      return Number.isNaN(start) || Number.isNaN(end) ? undefined : { start, end };
    }
    default:
      return value;
  }
};

export const fileName = (path: string): string => String(path).split("/").pop() as string;

/**
 * Thousands-grouped, no decimals, prefixed with the field's currency symbol so
 * an amount never reads as a bare number. Comma grouping (not the Indonesian
 * dot) to match InputNumber's hardcoded separator and
 * FormFieldTypes::formatMoney on the API, so the same amount reads identically
 * in the field, the table, and the export.
 */
const formatMoney = (value: unknown, currency = "Rp"): string => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);

  const amount = number.toLocaleString("en-US");
  const symbol = String(currency ?? "").trim();

  return symbol ? `${symbol} ${amount}` : amount;
};

const stripHtml = (html: unknown): string =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Human-readable rendering of a stored answer for tables and detail views.
 * `field.options` may be plain strings or {value,label} pairs.
 */
export const formatResponseValue = (field: CustomFieldShape, value: unknown, locale = "en"): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value) && !value.length) return "-";

  const options = normalizeOptions(field?.options, locale, field?.settings?.options_preset as string | undefined);
  const optionLabel = (v: unknown) => options.find((o) => o.value === String(v))?.label ?? String(v);
  const currency = (field?.settings?.currency as string | undefined) ?? "Rp";

  switch (field?.type) {
    case "select":
    case "radio":
      return optionLabel(value);
    case "multi_select":
    case "checkbox_group":
      return (Array.isArray(value) ? value : [value]).map(optionLabel).join(", ");
    case "tags":
      return (Array.isArray(value) ? value : [value]).join(", ");
    case "checkbox":
    case "switch":
      return value ? "Yes" : "No";
    case "date_range":
    case "month_range":
    case "year_range":
    case "time_range":
    case "slider_range": {
      if (value && typeof value === "object") {
        const range = value as { start?: string | number; end?: string | number };
        const parts = [range.start, range.end].filter((v) => v !== null && v !== undefined && v !== "");
        return parts.length ? parts.join(" - ") : "-";
      }
      return String(value);
    }
    case "price":
      return formatMoney(value, currency);
    case "price_range": {
      if (value && typeof value === "object") {
        const range = value as { start?: string | number; end?: string | number };
        const parts = [range.start, range.end].filter((v) => v !== null && v !== undefined && v !== "");
        return parts.length ? parts.map((v) => formatMoney(v, currency)).join(" - ") : "-";
      }
      return String(value);
    }
    case "rich_text":
      return stripHtml(value) || "-";
    case "file":
      return (Array.isArray(value) ? value : [value]).map((v) => fileName(String(v))).join(", ") || "-";
    default:
      if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
  }
};

/**
 * Local (not UTC) YYYY-MM-DD formatting, inlined here to keep the folder
 * self-contained.
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalDateString = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/**
 * Answers re-keyed by `system_key`, which is what `settings.depends_on` names.
 *
 * A renderer is handed one field and one value, so a dependent select (city
 * narrowing on province) cannot see its parent on its own. Only whoever holds
 * every answer can build this, so every surface that renders fields one at a
 * time has to pass the result down: without it a province or city field decides
 * its country is missing and withdraws itself, even inside Indonesia.
 */
export const contextValuesFor = (
  fields: Array<Record<string, any>>,
  values: Record<string, any>,
  keyBy = "ulid"
): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const field of fields) {
    if (!field?.system_key) continue;
    const key = String(field[keyBy] ?? field.ulid ?? field.id ?? "");
    out[field.system_key] = values[key] ?? null;
  }
  return out;
};

/**
 * The extra answers a city pick implies, keyed the same way as the value map.
 *
 * Answering a city answers its province too, so nobody has to know that
 * Tangerang Selatan sits in Banten before they can name their own city. The
 * province is still stored as its own field with its own label, so
 * `custom_field_values`, exports and analytics are unchanged.
 *
 * `regions` is the lazily imported `indonesiaRegions` module; pass null before
 * it has loaded and this is a no-op.
 */
export const derivedLocationValues = (
  field: Record<string, any> | null | undefined,
  value: unknown,
  fields: Array<Record<string, any>>,
  regions: Record<string, any> | null,
  keyBy = "ulid"
): Record<string, string> => {
  if (!regions || field?.type !== "city" || typeof value !== "string" || !value) return {};

  const province = fields.find((f) => f?.type === "province");
  if (!province) return {};

  const city = regions.INDONESIA_CITIES.find((row: any) => row.label === value);
  const match = city
    ? regions.INDONESIA_PROVINCES.find((row: any) => row.value === city.province)
    : null;
  if (!match) return {};

  const key = String(province[keyBy] ?? province.ulid ?? province.id ?? "");
  return key ? { [key]: match.label } : {};
};

/**
 * Fields the form answers on someone's behalf, so it should not also ask.
 *
 * Province is the only one today: picking a city answers it, so showing it too
 * is a control nobody has to touch. It is still a field, still stored, still in
 * exports and analytics - it just is not put to the respondent.
 *
 * The exception is a province the organiser marked required. Hiding a required
 * field means a form that can be blocked by something the respondent was never
 * shown, so that one stays on screen and simply fills itself in when a city is
 * chosen.
 */
export const derivedFieldKeys = (
  fields: Array<Record<string, any>>,
  keyBy = "ulid"
): Set<string> => {
  const active = fields.filter((field) => field?.is_active !== false);
  const city = active.find((field) => field?.type === "city");
  const province = active.find((field) => field?.type === "province");
  if (!city || !province) return new Set();

  const required = province.validation?.required ?? province.required ?? false;
  if (required) return new Set();

  const key = String(province[keyBy] ?? province.ulid ?? province.id ?? "");
  return key ? new Set([key]) : new Set();
};

/**
 * Province name shortened for display beside a city, never for storage.
 *
 * On a phone the row has about 300px for a city, its province and a check.
 * "Kabupaten Bangka Selatan" next to "Kepulauan Bangka Belitung" does not fit,
 * and the city is the part being chosen, so the province is what gives way. Only
 * the two long prefixes are touched; everything else is already short enough.
 */
export const shortProvinceLabel = (label: string): string =>
  label.replace(/^Kepulauan /, "Kep. ").replace(/^Daerah Istimewa /, "DI ");

/**
 * Jabodetabek, lifted to the top of a city list that spans every province.
 * Greater Jakarta is where most respondents are, and reaching Bekasi otherwise
 * means scrolling past Aceh. Read in the order they are named locally - Jakarta,
 * Tangerang, Bekasi, Depok, Bogor - with the kota before its kabupaten, which is
 * why this is a list and not a set: `LocationCombobox` pins in this order.
 */
export const JABODETABEK_CITIES: string[] = [
  "Kota Jakarta Pusat",
  "Kota Jakarta Selatan",
  "Kota Jakarta Barat",
  "Kota Jakarta Timur",
  "Kota Jakarta Utara",
  "Kota Tangerang",
  "Kota Tangerang Selatan",
  "Kabupaten Tangerang",
  "Kota Bekasi",
  "Kabupaten Bekasi",
  "Kota Depok",
  "Kota Bogor",
  "Kabupaten Bogor",
];
