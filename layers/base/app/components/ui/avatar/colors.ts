/**
 * Colours for Avatar's initials fallback, all written in OKLCH. A name becomes
 * one hue, and each variant turns that hue into CSS: `gel` (the default) and
 * `mesh`. The initials are always white, so a colourway too light for them is
 * darkened just enough to keep MIN_WHITE_CONTRAST.
 */

export const AVATAR_VARIANTS = ["gel", "mesh"] as const;

export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

/** WCAG contrast the white initials keep against the middle of every tile. */
const MIN_WHITE_CONTRAST = 3;

/** [lightness, chroma, hue in degrees]. */
type Oklch = [number, number, number];

/**
 * Base hues the fallback never lands on, as inclusive [from, to] ranges.
 * 64-120 is the amber/ochre and olive/mustard band, removed on the owner's call.
 */
export const AVATAR_EXCLUDED_HUES: [number, number][] = [[64, 120]];

export function isAvatarHueExcluded(hue: number): boolean {
  return AVATAR_EXCLUDED_HUES.some(([from, to]) => hue >= from && hue <= to);
}

const allowedHues = Array.from({ length: 360 }, (_, hue) => hue).filter(
  (hue) => !isAvatarHueExcluded(hue)
);

/**
 * Fallback hue for a name. A name whose hash lands on an excluded hue moves to
 * an allowed one drawn from the rest of the hash, so every other name keeps the
 * colour it has always had.
 */
export function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  if (!isAvatarHueExcluded(hue)) {
    return hue;
  }
  return allowedHues[Math.floor(Math.abs(hash) / 360) % allowedHues.length];
}

const round3 = (value: number) => Math.round(value * 1000) / 1000;

function oklchToLinearSrgb(l: number, c: number, hue: number): [number, number, number] {
  const radians = (hue * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
}

function toGamma(channel: number): number {
  const value = Math.min(1, Math.max(0, channel));
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

function toLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * WCAG contrast of white against `base` with `washes` painted over it in order,
 * each at its alpha, composited the way browsers stack background layers.
 */
function whiteContrastOver(base: Oklch, washes: [Oklch, number][] = []): number {
  let pixel = oklchToLinearSrgb(...base).map(toGamma);
  for (const [colour, alpha] of washes) {
    const paint = oklchToLinearSrgb(...colour).map(toGamma);
    pixel = pixel.map((channel, i) => channel * (1 - alpha) + paint[i] * alpha);
  }
  const [red, green, blue] = pixel.map(toLinear);
  return 1.05 / (0.2126 * red + 0.7152 * green + 0.0722 * blue + 0.05);
}

/** The smallest drop in lightness that gets `contrastAt` to MIN_WHITE_CONTRAST. */
function darkeningFor(contrastAt: (drop: number) => number): number {
  if (contrastAt(0) >= MIN_WHITE_CONTRAST) {
    return 0;
  }
  let low = 0;
  let high = 0.4;
  for (let step = 0; step < 12; step++) {
    const mid = (low + high) / 2;
    if (contrastAt(mid) >= MIN_WHITE_CONTRAST) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return Math.ceil(high * 1000) / 1000;
}

/**
 * Mesh: three radial blobs over a base, as [lightness, chroma, hue offset].
 * `weight` is each blob's alpha at the tile's centre, where the initials sit,
 * worked out from its position and fade.
 */
const MESH_BLOBS: { at: string; stop: Oklch; fade: number; weight: number }[] = [
  { at: "15% 15%", stop: [0.78, 0.26, 0], fade: 50, weight: 0.18 },
  { at: "85% 80%", stop: [0.52, 0.28, 30], fade: 50, weight: 0.21 },
  { at: "60% 40%", stop: [0.65, 0.3, 12], fade: 55, weight: 0.7 },
];

const MESH_BASE: Oklch = [0.45, 0.2, 18];

const meshCache = new Map<number, string>();

export function avatarMeshGradient(hue: number): string {
  const cached = meshCache.get(hue);
  if (cached !== undefined) {
    return cached;
  }
  const turn = ([l, c, offset]: Oklch, drop: number): Oklch => [
    round3(l - drop),
    c,
    (hue + offset) % 360,
  ];
  const drop = darkeningFor((by) =>
    whiteContrastOver(
      turn(MESH_BASE, by),
      [...MESH_BLOBS].reverse().map(({ stop, weight }): [Oklch, number] => [turn(stop, by), weight])
    )
  );
  const css = ([l, c, h]: Oklch, alpha?: number) =>
    `oklch(${l} ${c} ${h}${alpha === undefined ? "" : ` / ${alpha}`})`;
  const gradient = [
    ...MESH_BLOBS.map(({ at, stop, fade }) => {
      const colour = turn(stop, drop);
      return `radial-gradient(at ${at}, ${css(colour)} 0%, ${css(colour, 0)} ${fade}%)`;
    }),
    css(turn(MESH_BASE, drop)),
  ].join(", ");
  meshCache.set(hue, gradient);
  return gradient;
}

const chromaCache = new Map<string, number>();

/** The most chroma sRGB can show at this lightness and hue. */
function maxSrgbChroma(l: number, hue: number): number {
  const key = `${l}:${hue}`;
  const cached = chromaCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  let low = 0;
  let high = 0.4;
  for (let step = 0; step < 18; step++) {
    const mid = (low + high) / 2;
    const fits = oklchToLinearSrgb(l, mid, hue).every(
      (channel) => channel >= -0.0001 && channel <= 1.0001
    );
    if (fits) {
      low = mid;
    } else {
      high = mid;
    }
  }
  chromaCache.set(key, low);
  return low;
}

/** oklch() at `share` of the most chroma sRGB allows there, so no screen clips it. */
function srgbOklch(l: number, share: number, hue: number, alpha = 1): string {
  const lightness = round3(Math.min(0.97, Math.max(0, l)));
  const chroma = share * maxSrgbChroma(lightness, hue);
  return `oklch(${lightness} ${chroma.toFixed(3)} ${hue}${alpha < 1 ? ` / ${alpha}` : ""})`;
}

/** [lightness, share of the sRGB maximum chroma, drift from the tile's hue]. */
type GelStop = [number, number, number];

interface GelAnchor {
  hue: number;
  left: GelStop;
  right: GelStop;
  spot: GelStop;
  /** Broad glow in the spot colour rising from the lower left. */
  glow: number;
  /** Lighter wash across the top left, for tiles dark enough to show it. */
  top: number;
  /** How far the bottom edge sinks toward a deeper left colour. */
  sink: number;
}

function anchor(
  hue: number,
  left: GelStop,
  right: GelStop,
  spot: GelStop,
  glow: number,
  top: number,
  sink: number
): GelAnchor {
  return { hue, left, right, spot, glow, top, sink };
}

/**
 * Gel colourways, ascending by hue. 57, 127, 222 and 274 are sampled pixel by
 * pixel from the Iconly tiles the variant copies; the rest follow the same
 * recipe: a near-max-chroma blend from left to right whose light side drifts
 * toward yellow and whose dark side drifts away from it. A hue between two
 * anchors is interpolated.
 */
const GEL_ANCHORS: GelAnchor[] = [
  anchor(12, [0.64, 1, 8], [0.56, 0.97, -10], [0.74, 0.85, 26], 0.35, 0.15, 0.2),
  anchor(35, [0.68, 1, 5], [0.61, 0.98, -9], [0.76, 0.88, 15], 0.4, 0, 0.1),
  anchor(57, [0.73, 0.99, -3], [0.672, 0.99, -12], [0.776, 0.9, 10], 0.45, 0, 0),
  anchor(127, [0.85, 1, 0], [0.753, 0.97, 4], [0.909, 0.51, 0], 0, 0, 0),
  anchor(150, [0.8, 1, -6], [0.64, 0.95, 10], [0.88, 0.6, -14], 0.3, 0, 0),
  anchor(172, [0.78, 0.98, -6], [0.6, 0.95, 16], [0.85, 0.75, -14], 0.35, 0, 0),
  anchor(198, [0.78, 0.98, 2], [0.62, 0.95, 30], [0.85, 0.85, -6], 0.5, 0, 0),
  anchor(222, [0.736, 0.99, 10], [0.599, 0.92, 35], [0.808, 1, -25], 0.7, 0, 0),
  anchor(248, [0.55, 1, 4], [0.47, 0.97, 20], [0.67, 0.9, -10], 0.3, 0.5, 0.35),
  anchor(274, [0.5, 1, 0], [0.677, 0.89, 26], [0.59, 0.83, -10], 0, 0.9, 0.7),
  anchor(300, [0.56, 1, -6], [0.62, 0.92, 22], [0.66, 0.85, -16], 0.2, 0.6, 0.5),
  anchor(326, [0.62, 1, -4], [0.6, 0.95, 18], [0.72, 0.85, -12], 0.3, 0.4, 0.3),
  anchor(350, [0.66, 1, 4], [0.58, 0.97, 16], [0.75, 0.8, -8], 0.3, 0.2, 0.2),
];

/** The hues Gel's colourways are pinned to; handy for showing them all. */
export const AVATAR_GEL_ANCHOR_HUES = GEL_ANCHORS.map((gel) => gel.hue);

interface GelAround {
  from: GelAnchor;
  to: GelAnchor;
  t: number;
}

function gelAnchorsAround(hue: number): GelAround {
  for (let i = 0; i < GEL_ANCHORS.length; i++) {
    const from = GEL_ANCHORS[i];
    const to = GEL_ANCHORS[(i + 1) % GEL_ANCHORS.length];
    const span = (to.hue - from.hue + 360) % 360;
    const offset = (hue - from.hue + 360) % 360;
    if (offset <= span) {
      return { from, to, t: span === 0 ? 0 : offset / span };
    }
  }
  return { from: GEL_ANCHORS[0], to: GEL_ANCHORS[0], t: 0 };
}

type GelColour = { l: number; c: number; hue: number };

function gelStop(hue: number, key: "left" | "right" | "spot", { from, to, t }: GelAround): GelColour {
  const [fromL, fromC, fromShift] = from[key];
  const [toL, toC, toShift] = to[key];
  const shift = fromShift + (toShift - fromShift) * t;
  return {
    l: fromL + (toL - fromL) * t,
    c: fromC + (toC - fromC) * t,
    hue: Math.round((((hue + shift) % 360) + 360) % 360),
  };
}

/** A Gel colour as OKLCH, its chroma a share of the most sRGB holds there. */
function gelOklch({ l, c, hue }: GelColour): Oklch {
  const lightness = round3(Math.min(0.97, Math.max(0, l)));
  return [lightness, c * maxSrgbChroma(lightness, hue), hue];
}

/** The left-right blend at the tile's centre, mixed in OKLab like the gradient. */
function gelCentre(left: GelColour, right: GelColour): Oklch {
  const [l1, c1, h1] = gelOklch(left);
  const [l2, c2, h2] = gelOklch(right);
  const radians = Math.PI / 180;
  const a = (c1 * Math.cos(h1 * radians) + c2 * Math.cos(h2 * radians)) / 2;
  const b = (c1 * Math.sin(h1 * radians) + c2 * Math.sin(h2 * radians)) / 2;
  return [(l1 + l2) / 2, Math.hypot(a, b), Math.atan2(b, a) / radians];
}

type GelLayers = { fill: Record<string, string>; rim: Record<string, string> };

const gelCache = new Map<number, GelLayers>();

/**
 * Background and rim for a Gel tile. The fill and the rim are two layers laid
 * over the avatar box; Avatar adds the inner edge glow and the rim's opacity
 * itself so both can soften in dark mode. A colourway too light for white
 * initials (orange through azure) is darkened as a whole, chroma kept as high
 * as sRGB allows, until the middle of the tile reaches MIN_WHITE_CONTRAST.
 */
export function avatarGelLayers(hue: number): GelLayers {
  const cached = gelCache.get(hue);
  if (cached) {
    return cached;
  }
  const around = gelAnchorsAround(hue);
  const { from, to, t } = around;
  const mix = (key: "glow" | "top" | "sink") => from[key] + (to[key] - from[key]) * t;
  const lower = (colour: GelColour, drop: number): GelColour => ({ ...colour, l: colour.l - drop });
  const glow = mix("glow");
  const original = {
    left: gelStop(hue, "left", around),
    right: gelStop(hue, "right", around),
    spot: gelStop(hue, "spot", around),
  };
  const drop = darkeningFor((by) =>
    whiteContrastOver(gelCentre(lower(original.left, by), lower(original.right, by)), [
      [gelOklch(lower(original.spot, by)), glow / 2],
    ])
  );
  const left = lower(original.left, drop);
  const right = lower(original.right, drop);
  const spot = lower(original.spot, drop);
  const deepL = Math.min(left.l, right.l) - 0.05;
  const topHue = (left.hue + 6) % 360;

  const spotAt = (alpha: number) => srgbOklch(spot.l, spot.c, spot.hue, alpha);
  const deepAt = (alpha: number) => srgbOklch(deepL, 1, left.hue, alpha);
  const topAt = (alpha: number) => srgbOklch(left.l + 0.12, 0.95, topHue, alpha);

  const layers: GelLayers = {
    fill: {
      background: [
        `radial-gradient(circle at 23% 26%, ${spotAt(0.3)} 0%, ${spotAt(0.12)} 5%, ${spotAt(0)} 11%)`,
        `radial-gradient(circle at 24% 74%, ${spotAt(0.95)} 0%, ${spotAt(0.5)} 5%, ${spotAt(0)} 11%)`,
        `linear-gradient(to left, ${deepAt(0.55)} 0%, ${deepAt(0)} 22%)`,
        `radial-gradient(60% 45% at 12% 100%, ${deepAt(0.45)} 0%, ${deepAt(0)} 100%)`,
        `linear-gradient(to top, ${deepAt(mix("sink"))} 0%, ${deepAt(0)} 55%)`,
        `radial-gradient(85% 55% at 10% 0%, ${topAt(mix("top"))} 0%, ${topAt(0)} 100%)`,
        `radial-gradient(70% 60% at 24% 70%, ${spotAt(glow)} 0%, ${spotAt(0)} 100%)`,
        `linear-gradient(to right, ${srgbOklch(left.l, left.c, left.hue)} 16%, ${srgbOklch(right.l, right.c, right.hue)} 84%)`,
      ].join(", "),
    },
    rim: {
      padding: "max(1px, 1.3cqw)",
      background: `linear-gradient(to right, ${srgbOklch(0.95, 0.6, spot.hue)} 0%, oklch(1 0 0) 22%, oklch(1 0 0) 78%, ${srgbOklch(0.84, 0.55, right.hue)} 100%)`,
      mask: "linear-gradient(oklch(0 0 0) 0 0) content-box, linear-gradient(oklch(0 0 0) 0 0)",
      maskComposite: "exclude",
    },
  };
  gelCache.set(hue, layers);
  return layers;
}
