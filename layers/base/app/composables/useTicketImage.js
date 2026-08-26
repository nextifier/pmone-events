/**
 * Draws an e-ticket as a PNG and saves it to the device.
 *
 * Drawn, not captured. The obvious alternative - screenshot the /tickets/[ulid]
 * page with html2canvas or html-to-image - loses on the details that matter
 * here. The card's shape is a `clip-path: path()` plus an SVG `<clipPath>`,
 * which html2canvas does not implement at all; the palette is oklch, which it
 * cannot parse; and the foreignObject-based libraries need every web font
 * inlined and still rasterise unreliably in Safari, which is most of the phones
 * that open a ticket. A capture that degrades the QR is a ticket that does not
 * scan at the gate - a functional failure, not a cosmetic one. And "render it at
 * the mobile breakpoint" is not a size argument either: media queries key off
 * the viewport, so a desktop tab would apply desktop styles to the clone unless
 * the whole thing went through an offscreen iframe.
 *
 * So the layout below is a deliberate port of that page rather than a picture of
 * it, and it is written in the page's own units - CSS pixels at a 390px phone -
 * then scaled up on output, so the two can be read side by side.
 *
 * The QR is the one thing NOT redrawn: it comes from `buildQRSvgString`, the
 * same function the page renders, so the module shape is identical by
 * construction rather than by imitation.
 *
 * The palette is fixed light rather than themed: this image gets forwarded into
 * WhatsApp and printed, where the reader's theme is not ours to inherit, and a
 * dark ticket photographed off a bright screen scans worse.
 */
import { loadQRCodeLib, buildQRSvgString } from "../components/ui/qr-code/useQRCode";

/** Design units are CSS px at a 390px-wide phone; output is 3x that. */
const W = 390;
const SCALE = 3;
const PAD = 16;
const CONTENT = W - PAD * 2;

const INK = "#09090b";
const MUTED = "#71717a";
const LINE = "#e4e4e7";
const PAPER = "#ffffff";
/**
 * The page behind the ticket, a shade off white.
 *
 * On a pure white ground a white card with a hairline border is only a card if
 * you go looking for the hairline - the notches and the perforation, which are
 * the whole point of drawing a ticket shape, disappear. A single step of grey
 * costs nothing and makes the cutout read at a glance.
 */
const GROUND = "#f4f4f5";

const SANS = 'MinusOne, ui-sans-serif, system-ui, -apple-system, sans-serif';

/** Card geometry, matching ETicket.vue's own constants. */
const CARD_R = 28;
const NOTCH_R = 11;

/**
 * The two header glyphs, lifted verbatim from @iconify-json/hugeicons so they
 * are the same drawing the page uses. Rasterised through an <img>, not
 * hand-traced with Path2D: a traced copy drifts from the icon set the moment
 * anyone updates it, and nobody would notice.
 */
const ICONS = {
  calendar:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18"/><path d="M12.126 14H12m.125 4H12m-4.376-4H7.5m.125 4H7.5m9.125-4H16.5m-4.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-4.5-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m9-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0"/></g>',
  location:
    '<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M7 18c-1.829.412-3 1.044-3 1.754C4 20.994 7.582 22 12 22s8-1.006 8-2.246c0-.71-1.171-1.342-3-1.754"/><path d="M14.5 9a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z"/><path d="M13.257 17.494a1.813 1.813 0 0 1-2.514 0c-3.089-2.993-7.228-6.336-5.21-11.19C6.626 3.679 9.246 2 12 2s5.375 1.68 6.467 4.304c2.016 4.847-2.113 8.207-5.21 11.19Z"/></g>',
};

function font(size, weight = 400) {
  return `${weight} ${size}px ${SANS}`;
}

/** Split `text` into lines that each fit `maxWidth` at the ctx's current font. */
function wrap(ctx, text, maxWidth) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  return lines;
}

/** Paint pre-wrapped lines from a TOP edge, returning the y just past them. */
function paintLines(ctx, lines, x, top, { size, weight = 400, color = INK, lineHeight, align = "left" }) {
  ctx.font = font(size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";

  const step = lineHeight ?? Math.round(size * 1.25);
  // Baseline sits roughly 78% down the line box - close enough to how a browser
  // centres a line in `leading-snug`, and consistent between blocks.
  let cursor = top + step * 0.78;

  for (const l of lines) {
    ctx.fillText(l, x, cursor);
    cursor += step;
  }

  return top + step * lines.length;
}

/** An <img> from an SVG string. A data URL is same-origin, so no canvas taint. */
function svgImage(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function iconSvg(body, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="${color}">${body}</svg>`;
}

/**
 * The poster, through this site's own origin.
 *
 * Resolves to null on any failure - a missing poster costs the ticket a
 * thumbnail, while a rejected promise would cost the holder their download.
 */
function loadPoster(url) {
  if (!url) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  });
}

/** Rounded rectangle path. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * The ticket outline: a rounded card with a semicircular bite taken out of each
 * side where the stub begins. Same construction as ETicket.vue's `buildClip`,
 * in the same order, so the two shapes are the same shape.
 */
function ticketPath(ctx, x, y, w, h, stubH) {
  const R = CARD_R;
  const r = NOTCH_R;
  const ty = y + h - stubH;

  ctx.beginPath();
  ctx.moveTo(x + R, y);
  ctx.lineTo(x + w - R, y);
  ctx.arcTo(x + w, y, x + w, y + R, R);
  ctx.lineTo(x + w, ty - r);
  ctx.arc(x + w, ty, r, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(x + w, y + h - R);
  ctx.arcTo(x + w, y + h, x + w - R, y + h, R);
  ctx.lineTo(x + R, y + h);
  ctx.arcTo(x, y + h, x, y + h - R, R);
  ctx.lineTo(x, ty + r);
  ctx.arc(x, ty, r, Math.PI / 2, -Math.PI / 2, true);
  ctx.lineTo(x, y + R);
  ctx.arcTo(x, y, x + R, y, R);
  ctx.closePath();
}

/** Header poster: the page's `w-20 aspect-4/5`. */
const POSTER_W = 80;
const POSTER_H = 100;

/** The page's `w-44` QR. */
const QR_SIZE = 176;

const PAGE_PAD = 20;

/**
 * Lay out "Entry Ticket · Regular · Pre-registration" - segments joined by a
 * middot - wrapping between segments rather than mid-word, because breaking
 * "Pre-registration" across two lines to save four pixels reads worse than a
 * short second line.
 *
 * Returns an array of lines, each an array of segments.
 */
function layoutSegments(ctx, segments, maxWidth, size) {
  ctx.font = font(size);

  const lines = [];
  let line = [];

  const widthOf = (parts) =>
    parts.reduce((sum, part) => sum + ctx.measureText(part).width, 0) +
    Math.max(0, parts.length - 1) * SEGMENT_GAP;

  for (const segment of segments) {
    const next = [...line, segment];
    if (line.length && widthOf(next) > maxWidth) {
      lines.push(line);
      line = [segment];
    } else {
      line = next;
    }
  }
  if (line.length) lines.push(line);

  return lines;
}

/** Width taken by the "· " between two segments, dot included. */
const SEGMENT_GAP = 16;

/** Paint segment lines centred, with a muted dot between neighbours. */
function paintSegments(ctx, lines, centerX, top, size) {
  ctx.font = font(size);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const step = 20;
  let cursor = top;

  for (const parts of lines) {
    const widths = parts.map((part) => ctx.measureText(part).width);
    const total =
      widths.reduce((a, b) => a + b, 0) + Math.max(0, parts.length - 1) * SEGMENT_GAP;

    let x = centerX - total / 2;
    const baseline = cursor + step * 0.78;

    parts.forEach((part, index) => {
      if (index > 0) {
        ctx.fillStyle = LINE;
        ctx.beginPath();
        ctx.arc(x + SEGMENT_GAP / 2, baseline - size * 0.3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        x += SEGMENT_GAP;
      }
      ctx.fillStyle = index === 0 ? INK : MUTED;
      ctx.fillText(part, x, baseline);
      x += widths[index];
    });

    cursor += step;
  }

  return cursor;
}

/** A muted line of text with a 16px icon in its left gutter. */
function paintIconLines(ctx, icon, lines, x, top, maxWidth) {
  if (icon) ctx.drawImage(icon, x, top + 2, 16, 16);

  return paintLines(ctx, lines, x + 22, top, {
    size: 14,
    color: MUTED,
    lineHeight: 20,
  });
}

/** The day/session pill: hairline border, optional leading icon. */
function paintChip(ctx, text, centerX, top, icon) {
  const h = 30;
  const padX = 12;
  const gap = 6;
  const iconW = icon ? 16 + gap : 0;

  ctx.font = font(14, 500);
  const textW = ctx.measureText(text).width;
  const w = padX * 2 + iconW + textW;
  const x = centerX - w / 2;

  ctx.beginPath();
  ctx.roundRect(x + 0.5, top + 0.5, w - 1, h - 1, h / 2);
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (icon) ctx.drawImage(icon, x + padX, top + (h - 16) / 2, 16, 16);

  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padX + iconW, top + h / 2 + 0.5);
  ctx.textBaseline = "alphabetic";
}
export function useTicketImage() {
  /**
   * @returns {Promise<Blob>}
   */
  async function renderTicketPng(data) {
    const {
      qrToken,
      posterUrl = "",
      eventTitle = "",
      eventDate = "",
      eventVenue = "",
      attendeeName = "",
      ticketTitle = "",
      tier = "",
      day = "",
      session = "",
      sessionDetail = "",
      phase = "",
      orderNumber = "",
      scanHint = "",
    } = data;

    if (!qrToken) throw new Error("No QR token");

    // Everything that has to arrive before the first measureText: the face, or
    // every line is laid out against fallback metrics and painted in the real
    // one; and the images, because their real dimensions decide the layout.
    const [, qrLib, poster, calendarIcon, locationIcon] = await Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      loadQRCodeLib(),
      loadPoster(posterUrl),
      svgImage(iconSvg(ICONS.calendar, MUTED)).catch(() => null),
      svgImage(iconSvg(ICONS.location, MUTED)).catch(() => null),
    ]);

    const qrSvg = buildQRSvgString(qrLib.create(qrToken, { errorCorrectionLevel: "M" }), {
      size: QR_SIZE * SCALE,
      margin: 2,
      fgColor: INK,
      bgColor: "transparent",
      styleVariant: "rounded",
    });
    const qrImage = await svgImage(qrSvg);

    // ---- measure -----------------------------------------------------------
    // A scratch context, because wrapping needs font metrics and the real canvas
    // cannot be sized until the wrapping is known. Metrics do not depend on
    // canvas size, so measuring here and painting there agree.
    const scratch = document.createElement("canvas").getContext("2d");

    const textX = PAD + POSTER_W + 16;
    const textW = W - textX - PAD;

    scratch.font = font(20, 600);
    const titleLines = wrap(scratch, eventTitle, textW);

    scratch.font = font(14);
    const dateLines = eventDate ? wrap(scratch, eventDate, textW - 22) : [];
    const venueLines = eventVenue ? wrap(scratch, eventVenue, textW - 22) : [];

    let headerTextH = titleLines.length * 27;
    if (dateLines.length) headerTextH += 6 + dateLines.length * 20;
    if (venueLines.length) headerTextH += 4 + venueLines.length * 20;

    const headerH = Math.max(poster ? POSTER_H : 0, headerTextH);

    const innerW = CONTENT - 48;

    scratch.font = font(24, 600);
    const nameLines = wrap(scratch, attendeeName, innerW);

    const metaLines = layoutSegments(
      scratch,
      [ticketTitle, tier, phase].filter(Boolean),
      innerW,
      14
    );

    const chips = [day, session].filter(Boolean);

    scratch.font = font(14);
    const detailLines = sessionDetail ? wrap(scratch, sessionDetail, innerW) : [];
    const hintLines = scanHint ? wrap(scratch, scanHint, innerW) : [];

    let bodyH = 28; // pt-7
    bodyH += nameLines.length * 30;
    if (metaLines.length) bodyH += 6 + metaLines.length * 20;
    bodyH += 20 + QR_SIZE;
    if (chips.length) bodyH += 20 + chips.length * 30 + (chips.length - 1) * 6;
    if (hintLines.length) bodyH += 14 + hintLines.length * 20;
    if (detailLines.length) bodyH += 10 + detailLines.length * 20;
    bodyH += 24; // pb-6

    const stubH = orderNumber ? 16 + 20 + 20 : 0;
    const cardH = bodyH + stubH;

    const totalH = PAGE_PAD * 2 + headerH + 24 + cardH;

    // ---- paint -------------------------------------------------------------
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = Math.round(totalH) * SCALE;

    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, W, totalH);

    let y = PAGE_PAD;

    // Header: poster, then title / date / venue beside it.
    if (poster) {
      ctx.save();
      roundRect(ctx, PAD, y, POSTER_W, POSTER_H, 12);
      ctx.clip();
      // object-cover: fill the box on the tighter axis and centre the overflow.
      const ratio = Math.max(POSTER_W / poster.width, POSTER_H / poster.height);
      const dw = poster.width * ratio;
      const dh = poster.height * ratio;
      ctx.drawImage(poster, PAD + (POSTER_W - dw) / 2, y + (POSTER_H - dh) / 2, dw, dh);
      ctx.restore();

      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      roundRect(ctx, PAD + 0.5, y + 0.5, POSTER_W - 1, POSTER_H - 1, 12);
      ctx.stroke();
    }

    let ty = y + 2;
    ty = paintLines(ctx, titleLines, textX, ty, { size: 20, weight: 600, lineHeight: 27 });

    if (dateLines.length) {
      ty += 6;
      ty = paintIconLines(ctx, calendarIcon, dateLines, textX, ty, textW);
    }
    if (venueLines.length) {
      ty += 4;
      ty = paintIconLines(ctx, locationIcon, venueLines, textX, ty, textW);
    }

    y += headerH + 24;

    // Ticket card: fill, hairline, and the perforation across the stub seam.
    const cardTop = y;
    ticketPath(ctx, PAD, cardTop, CONTENT, cardH, stubH);
    ctx.fillStyle = PAPER;
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.stroke();

    let cy = cardTop + 28;
    const midX = PAD + CONTENT / 2;

    cy = paintLines(ctx, nameLines, midX, cy, {
      size: 24,
      weight: 600,
      lineHeight: 30,
      align: "center",
    });

    if (metaLines.length) {
      cy += 6;
      cy = paintSegments(ctx, metaLines, midX, cy, 14);
    }

    cy += 20;
    ctx.drawImage(qrImage, midX - QR_SIZE / 2, cy, QR_SIZE, QR_SIZE);
    cy += QR_SIZE;

    if (chips.length) {
      cy += 20;
      for (const [index, chip] of chips.entries()) {
        paintChip(ctx, chip, midX, cy, index === 0 ? calendarIcon : null);
        cy += 30;
        if (index < chips.length - 1) cy += 6;
      }
    }

    // Last on the card, because it is an instruction rather than ticket data -
    // and because the page puts the day badge directly under the QR, which is
    // the order a holder already knows.
    if (hintLines.length) {
      cy += 14;
      cy = paintLines(ctx, hintLines, midX, cy, {
        size: 14,
        color: MUTED,
        lineHeight: 20,
        align: "center",
      });
    }

    if (detailLines.length) {
      cy += 10;
      cy = paintLines(ctx, detailLines, midX, cy, {
        size: 14,
        color: MUTED,
        lineHeight: 20,
        align: "center",
      });
    }

    if (stubH) {
      const seam = cardTop + cardH - stubH;
      ctx.save();
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(PAD + NOTCH_R, seam + 0.5);
      ctx.lineTo(PAD + CONTENT - NOTCH_R, seam + 0.5);
      ctx.stroke();
      ctx.restore();

      paintLines(ctx, [orderNumber], midX, seam + 16, {
        size: 14,
        color: MUTED,
        lineHeight: 20,
        align: "center",
      });
    }

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas produced no image"))),
        "image/png"
      );
    });
  }
  async function saveTicket(data, { fileName = "e-ticket.png" } = {}) {
    const blob = await renderTicketPng(data);
    saveBlob(blob, fileName);
  }

  /**
   * Every ticket on an order, saved one file at a time.
   *
   * The gap is not politeness: browsers throttle a burst of programmatic
   * downloads and silently drop the tail, so a four-person order would arrive as
   * two files with no error anywhere.
   */
  async function saveTickets(list, { fileNameFor } = {}) {
    const files = [];

    for (const [index, data] of list.entries()) {
      const blob = await renderTicketPng(data);
      files.push([blob, fileNameFor?.(data, index) ?? `e-ticket-${index + 1}.png`]);
    }

    if (!files.length) throw new Error("Nothing to save");

    for (const [index, [blob, name]] of files.entries()) {
      saveBlob(blob, name);
      if (index < files.length - 1) await new Promise((r) => setTimeout(r, 220));
    }
  }

  function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    // In the document, not detached: Safari ignores a click on an anchor that
    // was never attached.
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  return { renderTicketPng, saveTicket, saveTickets };
}
