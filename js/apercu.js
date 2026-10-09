/* Aperçu du billet à l'échelle selon le format choisi dans le formulaire de devis. */
(function () {
  const $ = (s) => document.querySelector(s), sel = $('#fSize'), box = $('#prevBox'), cap = $('#prevCap'), fig = $('#prev');
  if (!sel || !box) return;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const THEMES = { 'Concert': ['#6d28d9', '#ec4899'], 'Gala': ['#1f2937', '#b8892e'], 'Tournoi': ['#047857', '#0b1f3a'], 'Kermesse': ['#f59e0b', '#ef4444'], 'Soirée': ['#0f172a', '#06b6d4'], 'Conférence': ['#0b1f3a', '#38bdf8'], 'Spectacle': ['#7f1d1d', '#f59e0b'] };
  const theme = () => { const t = ($('#fType') || {}).value || ''; const k = Object.keys(THEMES).find((x) => t.startsWith(x)); return THEMES[k] || ['#0b1f3a', '#F28C28']; };
  const dims = () => {
    const v = sel.value, m = /(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+(?:[.,]\d+)?)\s*mm/i.exec(v);
    if (m) return [parseFloat(m[1].replace(',', '.')), parseFloat(m[2].replace(',', '.'))];
    if (/^Autre/.test(v)) { const w = parseFloat(($('[name=largeur]') || {}).value), h = parseFloat(($('[name=hauteur]') || {}).value); if (w >= 30 && h >= 30 && w <= 400 && h <= 400) return [w, h]; }
    return null;
  };
  const QR = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111'].map((r) => r.split('').map(Number));
  function svg(w, h) {
    const [c1, c2] = theme(), vert = h > w * 1.15, stub = vert ? Math.min(34, h * 0.22) : Math.min(28, w * 0.22);
    const mw = vert ? w : w - stub, mh = vert ? h - stub : h, title = (($('[name=evenement]') || {}).value || '').trim() || 'Votre évènement', date = (($('[name=date]') || {}).value || '').trim() || 'Date · Lieu';
    const pad = Math.min(mw, mh) * 0.1, t = title.length > 26 ? title.slice(0, 25) + '…' : title, fs = Math.max(2.2, Math.min((mw - pad * 3) / (t.length * 0.62), mh * 0.2));
    const q = Math.min(stub, vert ? w : h) * 0.5, qx = vert ? (w - q) / 2 : w - stub + (stub - q) / 2, qy = vert ? h - stub + (stub - q) / 2 : (h - q) / 2, cell = q / 7;
    let qr = ''; QR.forEach((r, y) => r.forEach((on, x) => { if (on) qr += `<rect x="${(qx + x * cell).toFixed(2)}" y="${(qy + y * cell).toFixed(2)}" width="${(cell + .05).toFixed(2)}" height="${(cell + .05).toFixed(2)}"/>`; }));
    const cut = vert ? `<line x1="0" y1="${h - stub}" x2="${w}" y2="${h - stub}"/>` : `<line x1="${w - stub}" y1="0" x2="${w - stub}" y2="${h}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aperçu du billet ${w} par ${h} millimètres"><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="${w}" height="${h}" rx="${Math.min(w, h) * 0.05}" fill="url(#pg)"/><rect x="${pad / 2}" y="${pad / 2}" width="${w - pad}" height="${h - pad}" rx="${Math.min(w, h) * 0.04}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".5"/>
      <g stroke="#fff" stroke-opacity=".6" stroke-width=".4" stroke-dasharray="1.6 1.2">${cut}</g>
      <g fill="#fff" font-family="system-ui,Segoe UI,Arial,sans-serif"><text x="${pad * 1.4}" y="${pad * 1.4 + fs * 0.35}" font-size="${(fs * 0.45).toFixed(2)}" opacity=".8" letter-spacing=".3">BILLET</text>
        <text x="${pad * 1.4}" y="${mh / 2 + fs * 0.35}" font-size="${fs.toFixed(2)}" font-weight="800">${esc(t)}</text>
        <text x="${pad * 1.4}" y="${mh - pad * 1.4}" font-size="${(fs * 0.5).toFixed(2)}" opacity=".9">${esc(date.slice(0, 40))}</text></g>
      <g fill="#fff">${qr}</g><text x="${vert ? w / 2 : w - stub / 2}" y="${vert ? h - pad * 0.9 : h - pad * 0.9}" fill="#fff" font-size="${(Math.min(stub, mw) * 0.1).toFixed(2)}" text-anchor="middle" font-family="monospace">N° 0001</text></svg>`;
  }
  const perSheet = (w, h) => { const f = (a, b) => Math.floor(190 / a) * Math.floor(277 / b); return Math.max(f(w, h), f(h, w)); };
  function draw() {
    $('#fCustom').hidden = !/^Autre/.test(sel.value);
    const d = dims();
    if (!d) { box.innerHTML = ''; const autre = /^Autre/.test(sel.value); fig.hidden = !autre; cap.textContent = autre ? "Indiquez la largeur et la hauteur pour voir l'aperçu." : ''; return; }
    fig.hidden = false; box.innerHTML = svg(d[0], d[1]);
    const n = perSheet(d[0], d[1]);
    cap.textContent = `${d[0]} × ${d[1]} mm · aperçu indicatif${n ? ` · environ ${n} billet${n > 1 ? 's' : ''} par feuille A4` : ''}`;
  }
  ['change', 'input'].forEach((ev) => document.getElementById('form').addEventListener(ev, (e) => { if (['fSize', 'fType'].includes(e.target.id) || ['evenement', 'date', 'largeur', 'hauteur'].includes(e.target.name)) draw(); }));
  /* formats du logiciel (Tarifs & formats) : remplacent la liste par défaut quand le paquet du site les contient */
  document.addEventListener('tpk:data', (e) => {
    const f = (e.detail && e.detail.formats) || []; if (!f.length) return;
    const keep = sel.value;
    sel.innerHTML = '<option value="">À conseiller</option>' + f.map((x) => `<option>${esc(x.name)} ${x.w} × ${x.h} mm</option>`).join('') + '<option>Autre (précisez ci-dessous)</option>';
    if ([...sel.options].some((o) => o.value === keep)) sel.value = keep; draw();
  });
  draw();
})();
