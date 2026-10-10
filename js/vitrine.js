(function () {
  const C = window.TAPAKILA_SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wa = (n, t) => `https://wa.me/${n}${t ? '?text=' + encodeURIComponent(t) : ''}`;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const base = C.vitrineUrl ? C.vitrineUrl.replace(/\/$/, '') : 'data', jsonUrl = C.vitrineUrl ? base + '/vitrine.json' : 'data/vitrine.json';
  const imgBase = C.imgBase ? C.imgBase.replace(/\/$/, '') : base + '/img';
  const img = (f) => (f ? `${imgBase}/${encodeURI(f)}`.replace(/'/g, '%27') : '');   // jamais d'apostrophe dans url('…') ; à passer dans esc() quand on l'écrit dans du HTML
  const safeLink = (u) => (/^https?:\/\//i.test(String(u || '')) ? String(u) : '');          // liens externes : http(s) uniquement
  const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const fd = (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${+m[3]} ${MO[+m[2] - 1]} ${m[1]}` : ''; };
  const when = (e) => (e.dateEnd && e.dateEnd !== e.date ? `${fd(e.date)} → ${fd(e.dateEnd)}` : fd(e.date)) + (e.time ? ' · ' + e.time : '');
  const money = (n, cur) => new Intl.NumberFormat('fr-FR').format(n) + ' ' + (cur || 'Ar');
  const API = C.vitrineUrl ? C.vitrineUrl.replace(/\/$/, '') : '';
  let data = { events: [], news: [], banners: [], packages: [], currency: 'Ar' };
  const F = { q: '', city: '', when: '', price: '', cat: '' };

  /* ---------- dates, compte à rebours, stock, prix ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addD = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; };
  const parseD = (s, h, mi, end) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], end ? 23 : h || 0, end ? 59 : mi || 0, end ? 59 : 0) : null; };
  const startOf = (e) => { const t = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?/i.exec(e.time || ''); return parseD(e.date, t ? Math.min(23, +t[1]) : 0, t && t[2] ? Math.min(59, +t[2]) : 0); };
  const endOf = (e) => parseD(e.dateEnd || e.date, 0, 0, true);
  const endDay = (e) => e.dateEnd && e.dateEnd >= e.date ? e.dateEnd : e.date;
  const rel = (e) => {
    const t = ymd(new Date()); if (e.date <= t && endDay(e) >= t) return e.date === t ? "Aujourd'hui" : 'En cours';
    const d = Math.round((parseD(e.date) - parseD(t)) / 864e5); return d === 1 ? 'Demain' : d > 1 && d <= 7 ? `Dans ${d} j` : '';
  };
  const stock = (e) => {
    if (e.booking !== 'billetterie' || !e.tickets || !e.tickets.length) return null;
    const op = e.tickets.filter((t) => !t.closed);
    if (!op.length) return { ended: true, out: false, low: false, left: 0 };
    const left = op.reduce((a, t) => a + t.left, 0), qty = op.reduce((a, t) => a + (t.qty || 0), 0);
    return { left, out: left <= 0, low: left > 0 && (left <= 10 || (qty > 0 && left / qty <= 0.2)), ended: false };
  };
  const minPrice = (e) => {
    if (e.tickets && e.tickets.length) return Math.min(...e.tickets.map((t) => t.price));
    if (/gratuit|free|entrée libre/i.test(e.price || '')) return 0;
    const m = /\d[\d\s.]*/.exec(e.price || ''); const n = m ? parseInt(m[0].replace(/\D/g, ''), 10) : NaN; return Number.isFinite(n) ? n : null;
  };
  const priceTxt = (e) => e.price || (minPrice(e) === null ? '' : minPrice(e) === 0 ? 'Gratuit' : 'À partir de ' + money(minPrice(e), data.currency));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function card(e) {
    const s = stock(e), r = rel(e);
    const bd = [s && s.out ? '<span class="bd red">Complet</span>' : s && s.ended ? '<span class="bd">Vente terminée</span>' : s && s.low ? `<span class="bd hot">Plus que ${s.left} place${s.left > 1 ? 's' : ''}</span>` : '', r ? `<span class="bd">${r}</span>` : ''].join('');
    return `<button class="evc${e.featured ? ' feat' : ''}${s && s.out ? ' out' : ''}" data-id="${Number(e.id) || 0}"><div class="im" ${e.img ? `style="background-image:url('${esc(img(e.img))}')"` : ''}>${e.featured ? '<span class="tag">À la une</span>' : ''}${e.heart ? '<span class="hrt" title="Coup de cœur">♥</span>' : ''}<div class="bds">${bd}</div></div>
      <div class="tx"><span class="dt">${esc(when(e))}</span><h3>${esc(e.title)}</h3><span class="meta">${esc([e.venue, e.city].filter(Boolean).join(' · '))}</span>${priceTxt(e) ? `<span class="pr">${esc(priceTxt(e))}</span>` : ''}</div></button>`;
  }
  const sect = (title, sub, list, cls) => (list.length ? `<div class="evs"><div class="evs-h"><h3>${title}</h3>${sub ? `<span class="mut">${sub}</span>` : ''}</div><div class="${cls || 'ev-grid'}">${list.map(card).join('')}</div></div>` : '');

  function matches(e) {
    if (F.cat && e.category !== F.cat) return false;
    if (F.city && e.city !== F.city) return false;
    if (F.q) { const h = norm([e.title, e.venue, e.city, e.category, e.organizer, e.description].join(' ')); if (!F.q.split(/\s+/).every((w) => h.includes(w))) return false; }
    if (F.when) {
      const now = new Date(), t = ymd(now), a = e.date, b = endDay(e); let lo = t, hi = t;
      if (F.when === 'week') hi = ymd(addD(now, 7));
      else if (F.when === 'weekend') { const d = now.getDay(); const sat = d === 0 ? addD(now, -1) : addD(now, 6 - d); lo = ymd(sat); hi = ymd(addD(sat, 1)); if (hi < t) return false; }
      else if (F.when === 'month') { lo = t; hi = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-31`; }
      if (!(a <= hi && b >= lo)) return false;
    }
    if (F.price) {
      const p = minPrice(e); if (p === null) return false;
      if (F.price === 'free' ? p !== 0 : F.price === 'lt10' ? !(p > 0 && p < 10000) : F.price === 'mid' ? !(p >= 10000 && p <= 30000) : !(p > 30000)) return false;
    }
    return true;
  }
  const active = () => !!(F.q || F.city || F.when || F.price || F.cat);

  function drawEvents() {
    const all = data.events;
    $('#evenements').hidden = !all.length; $('#mEv').hidden = !all.length;
    if (!all.length) return;
    $('#evBar').hidden = all.length < 2;
    const cities = [...new Set(all.map((e) => e.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    const cs = $('#evCity'); cs.innerHTML = '<option value="">Toutes les villes</option>' + cities.map((c) => `<option ${c === F.city ? 'selected' : ''}>${esc(c)}</option>`).join(''); cs.hidden = cities.length < 2;
    const cats = [...new Set(all.map((e) => e.category).filter(Boolean))];
    $('#evCats').innerHTML = cats.length > 1 ? [''].concat(cats).map((c) => `<button data-c="${esc(c)}" class="${c === F.cat ? 'on' : ''}">${c ? esc(c) : 'Tous'}</button>`).join('') : '';
    $$('#evCats button').forEach((b) => b.addEventListener('click', () => { F.cat = b.dataset.c; drawEvents(); }));
    $('#evReset').hidden = !active();
    const out = $('#evOut');
    if (active()) {
      const list = all.filter(matches);
      out.innerHTML = list.length ? `<div class="evs"><div class="evs-h"><h3>${list.length} évènement${list.length > 1 ? 's' : ''} trouvé${list.length > 1 ? 's' : ''}</h3></div><div class="ev-grid">${list.map(card).join('')}</div></div>`
        : '<div class="evs empty"><p>Aucun évènement ne correspond à votre recherche.</p><button class="pick" type="button" id="evR2">Voir tous les évènements</button></div>';
      const r2 = $('#evR2'); if (r2) r2.addEventListener('click', resetF);
    } else {
      const t = ymd(new Date()), in7 = ymd(addD(new Date(), 7)), feat = all.filter((e) => e.featured);
      if (all.length <= 3) out.innerHTML = sect('À la une', '', feat, 'ev-feat') + sect('Tous les évènements', '', all.filter((e) => !e.featured));
      else {
        const soon = all.filter((e) => !e.featured && e.date <= in7 && endDay(e) >= t).slice(0, 4);
        const hearts = all.filter((e) => e.heart && !e.featured).slice(0, 4);
        const last = all.filter((e) => { const s = stock(e); return s && s.low; }).sort((a, b) => stock(a).left - stock(b).left).slice(0, 4);
        out.innerHTML = sect('À la une', 'Mis en avant', feat, 'ev-feat') + sect('Bientôt', 'Dans les 7 prochains jours', soon) + sect('Coups de cœur <span class="hrt-i">♥</span>', 'Notre sélection', hearts) + sect('Dernières places', 'Ça part vite', last) + sect('Tous les évènements', `${all.length} à venir`, all);
      }
    }
    $$('.evc', out).forEach((b) => b.addEventListener('click', () => openEv(+b.dataset.id)));
  }
  function resetF() { Object.assign(F, { q: '', city: '', when: '', price: '', cat: '' }); $('#evQ').value = ''; $('#evWhen').value = ''; $('#evPrice').value = ''; drawEvents(); }
  let qT;
  $('#evQ').addEventListener('input', (ev) => { clearTimeout(qT); qT = setTimeout(() => { F.q = norm(ev.target.value).trim(); drawEvents(); }, 150); });
  $('#evCity').addEventListener('change', (ev) => { F.city = ev.target.value; drawEvents(); });
  $('#evWhen').addEventListener('change', (ev) => { F.when = ev.target.value; drawEvents(); });
  $('#evPrice').addEventListener('change', (ev) => { F.price = ev.target.value; drawEvents(); });
  $('#evReset').addEventListener('click', resetF);

  /* ---------- fiche évènement ---------- */
  let cdT = 0;
  const shareUrl = (e) => location.href.split('#')[0] + '#ev-' + e.id;
  function countdown(e) {
    const el = $('#cd'); if (!el) { clearInterval(cdT); return; }
    const s = startOf(e), en = endOf(e), n = new Date();
    if (!s) { el.hidden = true; return; }
    if (n >= s) { el.className = 'cd live'; el.innerHTML = n <= en ? '<b>● En cours</b>' : '<b>Évènement terminé</b>'; return; }
    let d = Math.floor((s - n) / 1000); const dd = Math.floor(d / 86400); d %= 86400; const hh = Math.floor(d / 3600); d %= 3600;
    el.className = 'cd'; el.innerHTML = `<span class="cd-l">Début dans</span>${[[dd, 'jours'], [hh, 'h'], [Math.floor(d / 60), 'min'], [d % 60, 's']].map(([v, u]) => `<span class="cd-b"><b>${pad(v)}</b><i>${u}</i></span>`).join('')}`;
  }
  function similar(e) {
    return data.events.filter((x) => x.id !== e.id).map((x) => ({ x, sc: (x.category && x.category === e.category ? 2 : 0) + (x.city && x.city === e.city ? 1 : 0) })).filter((o) => o.sc > 0).sort((a, b) => b.sc - a.sc || a.x.date.localeCompare(b.x.date)).slice(0, 3).map((o) => o.x);
  }
  function openEv(id) {
    const e = data.events.find((x) => x.id === id); if (!e) return;
    const s = stock(e);
    let act = '';
    if (e.booking === 'lien' && safeLink(e.link)) act = `<a class="btn" href="${esc(safeLink(e.link))}" target="_blank" rel="noopener">Réserver</a>`;
    else if (e.booking === 'billetterie') act = '<div id="shop"></div>';
    else if (e.booking === 'whatsapp') act = `<div class="row"><div><label>Votre nom</label><input id="rvN" autocomplete="name"></div><div><label>Téléphone</label><input id="rvT" inputmode="tel" autocomplete="tel"></div><div><label>Nombre de places</label><input id="rvQ" type="number" min="1" value="1"></div></div><button class="btn" id="rvGo">Réserver sur WhatsApp</button><div id="rvE" class="mut" style="margin-top:8px;color:#ff9aa8"></div>`;
    const sim = similar(e), msg = `${e.title} — ${when(e)}${e.venue ? ' · ' + e.venue : ''}`;
    $('#evBody').innerHTML = `${e.img ? `<img src="${esc(img(e.img))}" alt="${esc(e.title)}">` : ''}<span class="dt" style="color:var(--orange);font-weight:800">${esc(when(e))}</span><h3>${esc(e.title)}</h3>
      <div id="cd" class="cd"></div>
      <div class="mut">${esc([e.venue, e.city].filter(Boolean).join(' · '))}</div>
      ${s && s.out ? '<p class="stk red">Complet : plus aucune place disponible.</p>' : s && s.low ? `<p class="stk hot">Plus que ${s.left} place${s.left > 1 ? 's' : ''} : dépêchez-vous !</p>` : ''}
      ${priceTxt(e) ? `<p><b>${esc(priceTxt(e))}</b></p>` : ''}<p class="desc">${esc(e.description)}</p>${e.organizer ? `<p class="mut">Organisé par ${esc(e.organizer)}</p>` : ''}
      <div class="shr"><span class="mut">Partager</span><a href="${wa('', msg + '\n' + shareUrl(e))}" target="_blank" rel="noopener" data-sh="wa">WhatsApp</a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl(e))}" target="_blank" rel="noopener" data-sh="fb">Facebook</a><button type="button" data-sh="cp">Copier le lien</button>${navigator.share ? '<button type="button" data-sh="nat">Autres…</button>' : ''}</div>
      ${act}
      ${sim.length ? `<div class="sim"><h4>Dans le même esprit</h4><div class="ev-grid">${sim.map(card).join('')}</div></div>` : ''}`;
    $('#evModal').hidden = false; $('.modal-b', $('#evModal')).scrollTop = 0;
    try { history.replaceState(null, '', '#ev-' + e.id); } catch (x) { /* ignoré */ }
    clearInterval(cdT); countdown(e); cdT = setInterval(() => countdown(e), 1000);
    $$('.sim .evc').forEach((b) => b.addEventListener('click', () => openEv(+b.dataset.id)));
    $$('[data-sh]').forEach((b) => b.addEventListener('click', async () => {
      if (b.dataset.sh === 'cp') { try { await navigator.clipboard.writeText(shareUrl(e)); b.textContent = '✔ Lien copié'; } catch (x) { window.prompt('Copiez ce lien :', shareUrl(e)); } }
      else if (b.dataset.sh === 'nat') { try { await navigator.share({ title: e.title, text: msg, url: shareUrl(e) }); } catch (x) { /* annulé */ } }
    }));
    if (e.booking === 'billetterie') shop(e);
    const go = $('#rvGo');
    if (go) go.addEventListener('click', () => {
      const n = $('#rvN').value.trim(), t = $('#rvT').value.trim(), q = Math.max(1, parseInt($('#rvQ').value, 10) || 1);
      if (!n) { $('#rvE').textContent = 'Indiquez votre nom.'; return; }
      if (!/\d{6,}/.test(t.replace(/\D/g, ''))) { $('#rvE').textContent = 'Indiquez un numéro de téléphone valide.'; return; }
      const to = (e.phone || '').replace(/\D/g, '') || C.whatsapp;
      const m2 = ['*Réservation — ' + e.title + '*', `Évènement : ${e.title}`, `Date : ${fd(e.date)}`, `Nom : ${n}`, `Téléphone : ${t}`, `Quantité : ${q}`].join('\n');
      window.open(wa(to, m2), '_blank', 'noopener');
    });
  }

  /* ---------- billetterie : panier en étapes (billets → infos → paiement → billets) ---------- */
  const MM = [['mvola', 'MVola'], ['orange', 'Orange Money'], ['airtel', 'Airtel Money']];
  const payHtml = (p) => { const l = MM.filter(([k]) => p && p[k]).map(([k, n]) => `<li><b>${n}</b> : ${esc(p[k])}</li>`).join(''); return l ? `<ul class="payl">${l}</ul>${p.holder ? `<div class="mut">Au nom de ${esc(p.holder)}</div>` : ''}${p.note ? `<div class="mut">${esc(p.note)}</div>` : ''}` : '<p class="mut">L\'organisateur vous communiquera le numéro de paiement.</p>'; };
  const stepper = (n) => `<ol class="stp">${['Billets', 'Vos infos', 'Paiement', 'Mes billets'].map((s, i) => `<li class="${i + 1 === n ? 'on' : i + 1 < n ? 'ok' : ''}"><b>${i + 1 < n ? '✓' : i + 1}</b><span>${s}</span></li>`).join('')}</ol>`;
  const MAXL = 10, MAXT = 20;
  async function shop(e) {
    const box = $('#shop'); let tickets = e.tickets || [], pay = data.pay || {};
    if (API) { try { const r = await fetch(`${API}/events/${e.id}/tickets`); if (r.ok) { const j = await r.json(); tickets = j.tickets; pay = j.pay; } } catch (x) { /* instantané du site */ } }
    if (!tickets.length) { box.innerHTML = '<p class="mut">Les billets seront bientôt disponibles.</p>'; return; }
    const cart = {}, info = { n: '', p: '' };
    const lines = () => tickets.filter((t) => cart[t.id] > 0).map((t) => ({ t, qty: cart[t.id] }));
    const count = () => lines().reduce((a, l) => a + l.qty, 0), total = () => lines().reduce((a, l) => a + l.t.price * l.qty, 0);
    const recap = () => `<ul class="rcp">${lines().map((l) => `<li><span>${esc(l.t.name)} × ${l.qty}</span><b>${money(l.t.price * l.qty, data.currency)}</b></li>`).join('')}</ul><div class="tot">Total : <b>${money(total(), data.currency)}</b></div>`;
    const note = (t) => (t.closed ? 'vente terminée' : t.left <= 0 ? '' : t.left <= 10 || (t.qty && t.left / t.qty <= 0.2) ? `<span class="hotn">Plus que ${t.left}</span>` : '');
    function s1() {
      box.innerHTML = stepper(1) + `<div class="tkl">${tickets.map((t) => `<div class="tkr"><div><b>${esc(t.name)}</b><div class="mut">${money(t.price, data.currency)} ${note(t) ? '· ' + note(t) : ''}</div></div>${t.left > 0 ? `<div class="qty"><button type="button" data-d="-1" data-t="${t.id}" aria-label="Moins">−</button><output id="q${t.id}">${cart[t.id] || 0}</output><button type="button" data-d="1" data-t="${t.id}" aria-label="Plus">+</button></div>` : '<span class="soldout">Complet</span>'}</div>`).join('')}</div>
        <div class="cart" id="cart"></div><button class="btn" id="s1Go" disabled>Continuer</button><div id="shE" style="margin-top:8px;color:#ff9aa8"></div>`;
      const upd = () => {
        $$('.qty button', box).forEach((b) => { const t = tickets.find((x) => x.id === +b.dataset.t), q = cart[t.id] || 0; b.disabled = b.dataset.d === '-1' ? q <= 0 : q >= Math.min(MAXL, t.left) || count() >= MAXT; });
        tickets.forEach((t) => { const o = $('#q' + t.id, box); if (o) o.textContent = cart[t.id] || 0; });
        $('#cart').innerHTML = count() ? recap() : '<p class="mut">Ajoutez des billets pour continuer.</p>'; $('#s1Go').disabled = !count();
      };
      $$('.qty button', box).forEach((b) => b.addEventListener('click', () => { const t = tickets.find((x) => x.id === +b.dataset.t); cart[t.id] = Math.max(0, (cart[t.id] || 0) + +b.dataset.d); upd(); }));
      $('#s1Go').addEventListener('click', s2); upd();
    }
    function s2() {
      box.innerHTML = stepper(2) + `<div class="okb" style="margin-top:0">${recap()}</div><div class="row"><div><label>Votre nom</label><input id="shN" autocomplete="name" value="${esc(info.n)}"></div><div><label>Téléphone (WhatsApp)</label><input id="shT" inputmode="tel" autocomplete="tel" value="${esc(info.p)}"></div></div>
        <div class="acts"><button class="pick" type="button" id="s2Back">← Modifier mes billets</button><button class="btn" id="shGo">${API ? 'Commander' : 'Réserver sur WhatsApp'}</button></div><div id="shE" style="margin-top:8px;color:#ff9aa8"></div>`;
      $('#s2Back').addEventListener('click', s1);
      $('#shGo').addEventListener('click', async () => {
        const er = $('#shE'), n = $('#shN').value.trim(), ph = $('#shT').value.trim(), ls = lines(); info.n = n; info.p = ph;
        if (!ls.length) { er.textContent = 'Choisissez au moins un billet.'; return; }
        if (!n) { er.textContent = 'Indiquez votre nom.'; return; }
        if (!/\d{9,}/.test(ph.replace(/\D/g, ''))) { er.textContent = 'Indiquez un numéro de téléphone valide.'; return; }
        er.textContent = '';
        if (!API) {
          const to = (e.phone || '').replace(/\D/g, '') || C.whatsapp;
          const msg = ['*Réservation — ' + e.title + '*', `Évènement : ${e.title}`, `Date : ${fd(e.date)}`].concat(ls.map((l) => `Billet : ${l.t.name} × ${l.qty}`), [`Nom : ${n}`, `Téléphone : ${ph}`, `Total : ${money(total(), data.currency)}`]).join('\n');
          window.open(wa(to, msg), '_blank', 'noopener'); box.insertAdjacentHTML('beforeend', `<div class="okb">Message prêt dans WhatsApp : envoyez-le. L'organisateur confirmera votre réservation et vous indiquera comment payer.${payHtml(pay)}</div>`); return;
        }
        const btn = $('#shGo'); btn.disabled = true;
        try {
          const r = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: e.id, name: n, phone: ph, items: ls.map((l) => ({ ticket_id: l.t.id, qty: l.qty })) }) });
          const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Erreur');
          try { localStorage.setItem('tpk_order', JSON.stringify({ ref: j.ref, phone: ph })); } catch (x) { /* ignoré */ }
          done(box, j, ph);
        } catch (x) { er.textContent = x.message || 'Réseau indisponible, réessayez.'; btn.disabled = false; }
      });
    }
    s1();
  }
  function done(box, j, ph) {
    box.innerHTML = `<div id="stpH">${stepper(3)}</div><div class="okb" style="margin-top:0"><h4>Commande ${esc(j.ref)} enregistrée</h4><p>Vos places sont bloquées pendant 24 h. Envoyez <b>${money(j.total, data.currency)}</b> par mobile money :</p>${payHtml(j.pay)}
      <p>Indiquez <b>${esc(j.ref)}</b> comme motif, puis saisissez ci-dessous la référence de la transaction reçue par SMS.</p>
      <div class="row"><div><label>Réf. transaction</label><input id="pfT" maxlength="40"></div><div><label>Moyen utilisé</label><select id="pfM"><option value="">—</option>${MM.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div></div>
      <button class="btn" id="pfGo">J'ai payé</button> <button class="pick" id="pfSt" type="button">Vérifier l'état</button><div id="pfE" style="margin-top:8px"></div></div>`;
    const msg = (t, bad) => { const el = $('#pfE'); el.textContent = t; el.style.color = bad ? '#ff9aa8' : 'var(--ok)'; };
    const st = { en_attente: 'En attente de vérification du paiement.', validee: '✔ Paiement confirmé : votre réservation est validée.', refusee: 'Réservation refusée : contactez-nous.', expiree: 'Réservation expirée : recommencez ou contactez-nous.' };
    $('#pfGo').addEventListener('click', async () => {
      const tx = $('#pfT').value.trim(); if (!tx) { msg('Saisissez la référence de la transaction.', true); return; }
      try { const r = await fetch(`${API}/orders/${j.ref}/proof`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: ph, tx_ref: tx, method: $('#pfM').value }) }); const o = await r.json(); if (!r.ok) throw new Error(o.error); msg('Merci ! Nous vérifions votre paiement et confirmons rapidement.'); } catch (x) { msg(x.message || 'Erreur', true); }
    });
    $('#pfSt').addEventListener('click', async () => {
      try { const r = await fetch(`${API}/orders/${j.ref}?phone=${encodeURIComponent(ph)}`); const o = await r.json(); if (!r.ok) throw new Error(o.error); msg(st[o.status] || o.status, o.status === 'refusee' || o.status === 'expiree'); if (o.status === 'validee') $('#stpH').innerHTML = stepper(4); if (o.status === 'validee' && o.token) { const a = document.createElement('a'); a.className = 'btn'; a.style.cssText = 'display:inline-block;margin-top:10px;text-decoration:none'; a.href = 'billet.html?t=' + o.token; a.textContent = 'Voir mes billets (QR code)'; $('#pfE').appendChild(document.createElement('br')); $('#pfE').appendChild(a); } } catch (x) { msg(x.message || 'Erreur', true); }
    });
  }
  window.addEventListener('hashchange', () => { const m = /^#ev-(\d+)$/.exec(location.hash); if (m && data.events.some((x) => x.id === +m[1])) openEv(+m[1]); });
  const close = () => { $('#evModal').hidden = true; clearInterval(cdT); try { history.replaceState(null, '', location.pathname + location.search); } catch (x) { /* ignoré */ } };
  $('#evX').addEventListener('click', close);
  $('#evModal').addEventListener('click', (ev) => { if (ev.target.id === 'evModal') close(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); });

  function drawNews() {
    $('#actus').hidden = !data.news.length; $('#mNews').hidden = !data.news.length;
    $('#newsGrid').innerHTML = data.news.map((n) => `<article class="nw">${n.img ? `<div class="im" style="background-image:url('${esc(img(n.img))}')"></div>` : ''}<div class="tx"><span class="mut" style="font-size:13px">${esc(fd(n.date))}</span>${n.sponsored ? `<span class="tag">Sponsorisé${n.sponsor ? ' · ' + esc(n.sponsor) : ''}</span>` : ''}<h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${safeLink(n.link) ? `<p><a href="${esc(n.link)}" target="_blank" rel="noopener${n.sponsored ? ' sponsored' : ''}">En savoir plus →</a></p>` : ''}</div></article>`).join('');
  }
  function drawBanner() {
    const b = data.banners; $('#banWrap').hidden = !b.length; if (!b.length) return;
    let i = 0; const show = () => { const x = b[i % b.length]; $('#banImg').src = img(x.img); $('#banImg').alt = x.label || 'Publicité'; $('#ban').href = /^https?:\/\//.test(x.link || '') ? x.link : '#'; i++; };
    show(); if (b.length > 1) setInterval(show, 6000);
  }
  const KL = { une: 'À la une', banniere: 'Bannière', actu: 'Article sponsorisé' };
  function drawPub() {
    const hello = 'Bonjour, je souhaite faire connaître mon évènement sur le site Tapakila.';
    $('#pubWa').href = wa(C.whatsapp, hello);
    const pk = data.packages.length ? data.packages : [];
    $('#pubGrid').innerHTML = pk.length ? pk.map((p) => `<div class="card pk reveal in"><h3>${esc(p.name)}</h3><div class="mut">${esc(KL[p.kind] || '')} · ${p.days} jours</div><div class="price">${money(p.price, data.currency)}</div><p>${esc(p.description)}</p><p style="margin-top:14px"><a class="pick" target="_blank" rel="noopener" href="${wa(C.whatsapp, hello + '\nFormule : ' + p.name)}">Choisir cette formule</a></p></div>`).join('')
      : '<div class="card"><h3>Sur demande</h3><p>Contactez-nous pour connaître nos formules de publicité.</p></div>';
  }
  drawPub();
  fetch(jsonUrl, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => {
    data = Object.assign(data, d); document.dispatchEvent(new CustomEvent('tpk:data', { detail: d })); drawEvents(); drawNews(); drawBanner(); drawPub();
    const hm = /^#ev-(\d+)$/.exec(location.hash); if (hm && data.events.some((x) => x.id === +hm[1])) { openEv(+hm[1]); }
  }).catch(() => { /* pas de données : les sections restent masquées */ });
})();
