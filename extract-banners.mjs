import fs from "fs";
import path from "path";

const APPS_DIR = "apps";
const BACKEND = "/Users/nextifier/Herd/pmone/database/seeders";
const IMAGES_OUT = path.join(BACKEND, "banner-images");
const JSON_OUT = path.join(BACKEND, "banners", "banners.json");

// Evaluate a module's `export default` literal with provided stubs.
function evalDefault(file, stubs = {}) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/import\s+[^;]*?from\s+['"][^'"]*?['"];?/g, "");
  src = src.replace(/export\s+default/, "return ");
  const names = Object.keys(stubs);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...names, src);
  return fn(...names.map((n) => stubs[n]));
}

// Evaluate apps/<app>/app/composables/content.js and return components.hero.bannerHero.
function loadBannerHero(file) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/import\s+[^;]*?from\s+['"][^'"]*?['"];?/g, "");
  src = src.replace(/export\s+const\s+useContentStore/, "const useContentStore");
  const makeDeep = () =>
    new Proxy(function () {}, {
      get: (_t, prop) => {
        if (prop === Symbol.toPrimitive) return () => "";
        if (prop === "then") return undefined;
        return makeDeep();
      },
      apply: () => makeDeep(),
    });
  const stubs = {
    t: (k) => k,
    computed: (f) => f(),
    ref: (v) => ({ value: v }),
    defineStore: (_name, arg) =>
      typeof arg === "function"
        ? arg
        : () => (typeof arg.state === "function" ? arg.state() : arg.state || {}),
    useI18n: () => ({ t: (k) => k, locale: { value: "en" } }),
    useAppConfig: () => makeDeep(),
    useRuntimeConfig: () => makeDeep(),
  };
  const names = Object.keys(stubs);
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    ...names,
    `${src}\nconst s = useContentStore();\nreturn s.components.hero.bannerHero;`,
  );
  return fn(...names.map((n) => stubs[n]));
}

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function resolve(locale, value) {
  if (typeof value !== "string") return value;
  if (value.startsWith("hero.banners.")) {
    const v = getByPath(locale, value);
    return v ?? value;
  }
  return value;
}

function copyImage(app, srcPath, username, usedNames) {
  if (!srcPath || !srcPath.startsWith("/")) return null;
  const abs = path.join(APPS_DIR, app, "public", srcPath);
  if (!fs.existsSync(abs)) {
    console.warn(`   ! missing image: ${abs}`);
    return null;
  }
  let base = path.basename(srcPath);
  const destDir = path.join(IMAGES_OUT, username);
  fs.mkdirSync(destDir, { recursive: true });
  // avoid collisions within the same project
  if (usedNames.has(base)) {
    const ext = path.extname(base);
    base = `${path.basename(base, ext)}-${usedNames.size}${ext}`;
  }
  usedNames.add(base);
  fs.copyFileSync(abs, path.join(destDir, base));
  return base;
}

const apps = fs
  .readdirSync(APPS_DIR)
  .filter((a) => fs.existsSync(path.join(APPS_DIR, a, "app/composables/content.js")));

const out = [];

for (const app of apps) {
  const contentFile = path.join(APPS_DIR, app, "app/composables/content.js");
  const enFile = path.join(APPS_DIR, app, "i18n/locales/en.ts");
  const cfgFile = path.join(APPS_DIR, app, "app/app.config.ts");

  let cfg;
  try {
    cfg = evalDefault(cfgFile, { defineAppConfig: (x) => x, process: { env: {} } });
  } catch (e) {
    console.warn(`[${app}] app.config eval failed: ${e.message}`);
    continue;
  }
  const username = cfg?.app?.projectUsername;
  const dataSource = cfg?.app?.dataSourceUsername || null;
  const name = cfg?.app?.name || app;
  if (dataSource && dataSource !== username) {
    console.warn(`   ~ ${app}: dataSourceUsername="${dataSource}" (site fetches from ${dataSource}, seeding under own project ${username})`);
  }
  if (!username) {
    console.warn(`[${app}] no projectUsername, skipping`);
    continue;
  }

  let bannerHero = [];
  try {
    bannerHero = loadBannerHero(contentFile) || [];
  } catch (e) {
    console.warn(`[${app}] content.js eval failed: ${e.message}`);
    continue;
  }
  if (!Array.isArray(bannerHero) || bannerHero.length === 0) {
    console.log(`[${app}] (${username}) no banners`);
    continue;
  }

  const locale = fs.existsSync(enFile) ? evalDefault(enFile, {}) : {};
  const usedNames = new Set();
  const banners = [];

  bannerHero.forEach((item, idx) => {
    const startTime = item.startTime || null;
    const endTime = item.endTime || null;

    if (item.adImage) {
      const file = copyImage(app, item.adImage.srcFull || item.adImage.src, username, usedNames);
      banners.push({
        type: "image",
        title: item.adImage.alt || null,
        description: null,
        cta_label: null,
        link: item.link || null,
        aspect_ratio: "4:1",
        image: file,
        start_time: startTime,
        end_time: endTime,
        sort_order: idx,
      });
      return;
    }

    const clean = (v) => {
      const r = resolve(locale, v);
      return typeof r === "string" && r.trim() ? r.trim() : null;
    };
    const title = clean(item.subHeadline);
    const description = clean(item.content);
    const ctaLabel = item.cta ? clean(item.cta.label) : null;
    const link = item.cta ? item.cta.link || null : null;
    const file = item.img ? copyImage(app, item.img.src, username, usedNames) : null;

    banners.push({
      type: file ? "image_text" : "text",
      title,
      description,
      cta_label: ctaLabel,
      link,
      aspect_ratio: null,
      image: file,
      start_time: startTime,
      end_time: endTime,
      sort_order: idx,
    });
  });

  out.push({ app, username, name, banners });
  const types = banners.reduce((m, b) => ((m[b.type] = (m[b.type] || 0) + 1), m), {});
  console.log(`[${app}] -> ${username} (${name}): ${banners.length} banners`, types);
}

fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
fs.writeFileSync(JSON_OUT, JSON.stringify(out, null, 2));
console.log(`\nWrote ${out.length} projects to ${JSON_OUT}`);
console.log(`Total banners: ${out.reduce((n, p) => n + p.banners.length, 0)}`);
