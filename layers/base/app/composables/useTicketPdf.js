// Builds e-ticket PDFs entirely in the browser (jsPDF). Each ticket is one full
// A4 page with a large, razor-sharp SQUARE QR drawn as true vector shapes (data
// modules + canonical finder eyes), so it scans reliably at the gate and prints
// crisp at any zoom. `download` saves one ticket; `downloadAll` puts every
// attendee on its own page in a single PDF. Nothing is rendered or stored
// server-side.
export function useTicketPdf() {
  function rgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  // Draw a SQUARE QR (matches the on-screen QRCode.vue "square" style): solid
  // data modules + a hollow 6-module finder frame with a solid 3-module pupil.
  function drawQr(doc, qrLib, value, x0, y0, sizeMm, inkHex) {
    const matrix = qrLib.create(String(value || ""), { errorCorrectionLevel: "M" });
    const mods = matrix.modules;
    const n = mods.size;
    const m = sizeMm / n;
    const inFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

    doc.setFillColor(...rgb(inkHex));
    doc.setDrawColor(...rgb(inkHex));

    // Data modules (skip the three finder zones; drawn as crisp frames below).
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (mods.get(r, c) && !inFinder(r, c)) {
          doc.rect(x0 + c * m, y0 + r * m, m, m, "F");
        }
      }
    }

    // Finder patterns: hollow 6m frame (1-module stroke) + solid 3m pupil.
    const finders = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    doc.setLineWidth(m);
    for (const [fr, fc] of finders) {
      const x = x0 + fc * m;
      const y = y0 + fr * m;
      doc.rect(x + 0.5 * m, y + 0.5 * m, 6 * m, 6 * m, "S");
      doc.rect(x + 2 * m, y + 2 * m, 3 * m, 3 * m, "F");
    }
  }

  // Render one full A4 e-ticket onto the current page of `doc`.
  function renderTicketPage(doc, qrLib, data) {
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
      checkedIn = false,
      orderNumber = "",
    } = data;

    const W = 210;
    const H = 297; // A4 portrait (mm)
    const M = 20; // page margin
    const cx = W / 2;
    const ink = "#0f172a";
    const muted = "#64748b";
    const faint = "#94a3b8";
    const line = "#e2e8f0";
    const ok = "#15803d";

    let y = 30;

    // Eyebrow.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(faint));
    doc.setCharSpace(1.2);
    doc.text("E-TICKET", M, y);
    doc.setCharSpace(0);
    y += 11;

    // Event title (left-aligned, wraps).
    if (eventTitle) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...rgb(ink));
      const lines = doc.splitTextToSize(eventTitle, W - M * 2);
      doc.text(lines, M, y);
      y += lines.length * 9.5;
    }

    // Date · venue.
    const metaParts = [eventDate, eventVenue].filter(Boolean);
    if (metaParts.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...rgb(muted));
      const meta = doc.splitTextToSize(metaParts.join("  ·  "), W - M * 2);
      y += 1;
      doc.text(meta, M, y);
      y += meta.length * 5.5;
    }

    // Hairline rule.
    y += 6;
    doc.setDrawColor(...rgb(line));
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 20;

    // Holder name (hero, centered, wraps).
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(...rgb(ink));
    const nameLines = doc.splitTextToSize(attendeeName || "-", W - M * 2);
    doc.text(nameLines, cx, y, { align: "center" });
    y += nameLines.length * 11 + 1;

    // Ticket · tier.
    const ticketLine = [ticketTitle, tier, phase].filter(Boolean).join("  ·  ");
    if (ticketLine) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(...rgb(muted));
      doc.text(ticketLine, cx, y, { align: "center" });
      y += 8;
    }

    // Day · session.
    const dayLine = [day, session].filter(Boolean).join("  ·  ");
    if (dayLine) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...rgb(ink));
      doc.text(dayLine, cx, y, { align: "center" });
      y += 9;
    }

    // Room and host, so a printed ticket says where to actually go.
    if (sessionDetail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...rgb(muted));
      doc.text(sessionDetail, cx, y, { align: "center" });
      y += 8;
    }

    // QR (vector, square) - the page hero.
    y += 6;
    const qrSize = 88;
    drawQr(doc, qrLib, qrToken, cx - qrSize / 2, y, qrSize, ink);
    y += qrSize + 9;

    // Scan hint.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(faint));
    doc.text("Show this code at the entrance", cx, y, { align: "center" });
    y += 8;

    // Checked-in.
    if (checkedIn) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...rgb(ok));
      doc.setCharSpace(0.8);
      doc.text("CHECKED IN", cx, y, { align: "center" });
      doc.setCharSpace(0);
    }

    // Perforation + order number, pinned to the foot.
    if (orderNumber) {
      doc.setDrawColor(...rgb(line));
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([1, 1.5], 0);
      doc.line(M, H - 34, W - M, H - 34);
      doc.setLineDashPattern([], 0);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...rgb(muted));
      doc.text(orderNumber, cx, H - 24, { align: "center" });
    }
  }

  function safeFileName(name) {
    return String(name || "e-ticket")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "e-ticket";
  }

  // Single attendee -> one A4 page.
  async function download(data) {
    const { jsPDF } = await import("jspdf");
    const qrLib = (await import("qrcode")).default;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    renderTicketPage(doc, qrLib, data);
    doc.save(data.fileName || `${safeFileName(data.attendeeName)}.pdf`);
  }

  // Many attendees -> one PDF, one A4 page each.
  async function downloadAll(list, sharedMeta = {}) {
    const tickets = (list || []).filter((t) => t && t.qrToken);
    if (!tickets.length) return;

    const { jsPDF } = await import("jspdf");
    const qrLib = (await import("qrcode")).default;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    tickets.forEach((ticket, i) => {
      if (i > 0) doc.addPage();
      renderTicketPage(doc, qrLib, { ...sharedMeta, ...ticket });
    });

    const tag = safeFileName(sharedMeta.orderNumber || "order");
    doc.save(`e-tickets-${tag}.pdf`);
  }

  return { download, downloadAll };
}
