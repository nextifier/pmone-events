/**
 * Draws an e-ticket as a PNG and saves it to the device.
 *
 * Drawn, not captured. A DOM screenshot of the card on screen would have to
 * survive `clip-path: path()`, an SVG `<clipPath url(#id)>`, oklch tokens, a
 * variable web font and a QR whose `fill` is the literal string
 * `var(--foreground)` - which resolves to nothing once the node is cloned into a
 * detached tree, so the code would come out black on black in dark mode. A
 * ticket whose QR does not scan is a broken ticket, so every pixel here is drawn
 * from data we already hold.
 *
 * The palette is fixed light rather than themed: this image gets forwarded into
 * WhatsApp and printed, where the reader's theme is not ours to inherit, and a
 * dark ticket photographed off a bright screen scans worse.
 */

const W = 1080;
const H = 1620;
const M = 88;

const INK = "#0a0a0a";
const MUTED = "#71717a";
const LINE = "#e4e4e7";
const PAPER = "#ffffff";

const SANS = 'MinusOne, ui-sans-serif, system-ui, -apple-system, sans-serif';

/** Centered text that wraps, returning the y after the last line. */
function centeredLines(ctx, text, y, { size, weight = 400, color = INK, lineHeight, maxWidth }) {
  if (!text) return y;

  ctx.font = `${weight} ${size}px ${SANS}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const limit = maxWidth ?? W - M * 2;
  const step = lineHeight ?? Math.round(size * 1.2);
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  let cursor = y;
  for (const l of lines) {
    ctx.fillText(l, W / 2, cursor);
    cursor += step;
  }

  return cursor - step;
}

function dashedRule(ctx, y) {
  ctx.save();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(M, y);
  ctx.lineTo(W - M, y);
  ctx.stroke();
  ctx.restore();
}

export function useTicketImage() {
  /**
   * @returns {Promise<Blob>}
   */
  async function renderTicketPng(data) {
    const {
      qrToken,
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

    // The face has to be loaded before the first measureText, or every line is
    // laid out against the fallback metrics and then painted in the real one.
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    let y = M + 52;

    y = centeredLines(ctx, eventTitle, y, { size: 46, weight: 600, lineHeight: 58 });

    const where = [eventDate, eventVenue].filter(Boolean).join("  ·  ");
    if (where) {
      y += 46;
      y = centeredLines(ctx, where, y, { size: 30, color: MUTED, lineHeight: 40 });
    }

    y += 64;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(W - M, y);
    ctx.stroke();

    // The holder is the largest thing on the ticket: it is what a person at the
    // door reads first to know the badge is theirs.
    y += 108;
    y = centeredLines(ctx, attendeeName, y, { size: 78, weight: 600, lineHeight: 88 });

    const what = [ticketTitle, tier, phase].filter(Boolean).join("  ·  ");
    if (what) {
      y += 54;
      y = centeredLines(ctx, what, y, { size: 32, color: MUTED, lineHeight: 42 });
    }

    const when = [day, session].filter(Boolean).join("  ·  ");
    if (when) {
      y += 52;
      y = centeredLines(ctx, when, y, { size: 36, weight: 500, lineHeight: 46 });
    }

    if (sessionDetail) {
      y += 42;
      y = centeredLines(ctx, sessionDetail, y, { size: 28, color: MUTED, lineHeight: 38 });
    }

    // The QR gets whatever vertical room is left, floored so a long name never
    // squeezes the one thing the ticket exists for.
    const qrTop = y + 76;
    const footer = 190;
    const qrSize = Math.max(460, Math.min(620, H - footer - qrTop));

    const qrCanvas = document.createElement("canvas");
    const qrLib = (await import("qrcode")).default;
    await qrLib.toCanvas(qrCanvas, String(qrToken), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: qrSize,
      color: { dark: INK, light: PAPER },
    });
    ctx.drawImage(qrCanvas, (W - qrSize) / 2, qrTop, qrSize, qrSize);

    let below = qrTop + qrSize + 54;
    if (scanHint) below = centeredLines(ctx, scanHint, below, { size: 28, color: MUTED, lineHeight: 38 }) + 8;

    if (orderNumber) {
      dashedRule(ctx, H - 130);
      centeredLines(ctx, orderNumber, H - 74, { size: 26, color: MUTED });
    }

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
        "image/png"
      );
    });
  }

  /**
   * Whether this browser can hand a file to the platform's own share sheet.
   *
   * This is the difference that decides the button's label. On iOS a plain
   * download lands in Files, never in Photos, and the share sheet's "Save Image"
   * is the only one-tap route to the camera roll. On Android a download does
   * reach the gallery, under a Download album. Probed with a real File because
   * `canShare` answers per payload, not per browser.
   */
  /**
   * Save one ticket to the device as a PNG.
   *
   * A plain download, on every platform that can do one - no share sheet.
   * `navigator.share({files})` was tried first here, and on Android it turned a
   * one-tap save into "open sheet, find Photos, confirm" for a person who only
   * wanted the file. The page already offers Copy link and Send on WhatsApp for
   * the sharing case, so the primary action can be the plain one.
   *
   * Where the file lands is the platform's business: Android puts it in
   * Downloads, which the media store indexes, so it shows up in Gallery.
   * iOS Safari puts it in Files > Downloads, and Photos stays a manual step -
   * there is no web API that writes to a camera roll, on any browser.
   */
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
