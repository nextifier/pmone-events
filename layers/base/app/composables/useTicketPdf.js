// Builds a single e-ticket PDF entirely in the browser (jsPDF). The QR is drawn
// as true vector shapes (dots + finder rings/pupils), so it stays razor sharp at
// any zoom or print size. Nothing is rendered or stored server-side.
export function useTicketPdf() {
  function rgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  // Draw the styled (rounded) QR as vector shapes onto the PDF.
  function drawQr(doc, matrix, x0, y0, sizeMm, inkHex) {
    const mods = matrix.modules;
    const n = mods.size;
    const m = sizeMm / n;
    const inFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

    doc.setFillColor(...rgb(inkHex));
    doc.setDrawColor(...rgb(inkHex));

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (mods.get(r, c) && !inFinder(r, c)) {
          doc.circle(x0 + (c + 0.5) * m, y0 + (r + 0.5) * m, m * 0.33, "F");
        }
      }
    }

    const finders = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    for (const [fr, fc] of finders) {
      const cx = x0 + (fc + 3.5) * m;
      const cy = y0 + (fr + 3.5) * m;
      doc.setLineWidth(m);
      doc.circle(cx, cy, 3 * m, "S"); // eye-frame ring
      doc.circle(cx, cy, 1.5 * m, "F"); // pupil
    }
  }

  async function download({
    qrToken,
    eventTitle = "",
    eventDate = "",
    eventVenue = "",
    attendeeName = "",
    ticketTitle = "",
    tier = "",
    day = "",
    session = "",
    checkedIn = false,
    orderNumber = "",
    fileName = "ticket.pdf",
  }) {
    const { jsPDF } = await import("jspdf");
    const qrLib = (await import("qrcode")).default;
    const matrix = qrLib.create(String(qrToken || ""), { errorCorrectionLevel: "M" });

    const W = 105;
    const H = 148; // A6 portrait (mm)
    const M = 12; // page margin
    const cx = W / 2;
    const ink = "#0f172a";
    const muted = "#64748b";
    const faint = "#94a3b8";
    const line = "#e2e8f0";
    const ok = "#15803d";

    const doc = new jsPDF({ unit: "mm", format: [W, H] });

    let y = 15;

    // Eyebrow.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...rgb(faint));
    doc.setCharSpace(0.8);
    doc.text("E-TICKET", M, y);
    doc.setCharSpace(0);
    y += 6;

    // Event title (left-aligned).
    if (eventTitle) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      doc.setTextColor(...rgb(ink));
      const lines = doc.splitTextToSize(eventTitle, W - M * 2);
      doc.text(lines, M, y);
      y += lines.length * 5.4;
    }

    // Date · venue.
    const metaParts = [eventDate, eventVenue].filter(Boolean);
    if (metaParts.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...rgb(muted));
      const meta = doc.splitTextToSize(metaParts.join("  ·  "), W - M * 2);
      y += 1.5;
      doc.text(meta, M, y);
      y += meta.length * 4.2;
    }

    // Hairline rule.
    y += 3;
    doc.setDrawColor(...rgb(line));
    doc.setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    y += 11;

    // Holder name (hero).
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(...rgb(ink));
    doc.text(attendeeName || "-", cx, y, { align: "center" });
    y += 6.5;

    // Ticket · tier.
    const ticketLine = [ticketTitle, tier].filter(Boolean).join("  ·  ");
    if (ticketLine) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...rgb(muted));
      doc.text(ticketLine, cx, y, { align: "center" });
    }
    y += 7;

    // QR (vector).
    const qrSize = 49;
    drawQr(doc, matrix, cx - qrSize / 2, y, qrSize, ink);
    y += qrSize + 5;

    // Scan hint.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...rgb(faint));
    doc.text("Show this code at the entrance", cx, y, { align: "center" });
    y += 7;

    // Day / session.
    const dayLine = [day, session].filter(Boolean).join("  ·  ");
    if (dayLine) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...rgb(ink));
      doc.text(dayLine, cx, y, { align: "center" });
      y += 5;
    }

    // Checked-in.
    if (checkedIn) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...rgb(ok));
      doc.setCharSpace(0.5);
      doc.text("CHECKED IN", cx, y, { align: "center" });
      doc.setCharSpace(0);
    }

    // Perforation + order number at the foot.
    if (orderNumber) {
      doc.setDrawColor(...rgb(line));
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([1, 1.2], 0);
      doc.line(M, H - 18, W - M, H - 18);
      doc.setLineDashPattern([], 0);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...rgb(muted));
      doc.text(orderNumber, cx, H - 11, { align: "center" });
    }

    doc.save(fileName);
  }

  return { download };
}
