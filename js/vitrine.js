(function () {
  const C = window.TAPAKILA_SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wa = (n, t) => `https://wa.me/${n}${t ? '?text=' + encodeURIComponent(t) : ''}`;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const base = C.vitrineUrl ? C.vitrineUrl.replace(/\/$/, '') : 'data', jsonUrl = C.vitrineUrl ? base + '/vitrine.json' : 'data/vitrine.json';
  const imgBase = C.imgBase ? C.imgBase.replace(/\/$/, '') : base + '/img';
  const img = (f) => (f ? `${imgBase}/${encodeURI(f)}` : '');
  const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const fd = (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${+m[3]} ${MO[+m[2] - 1]} ${m[1]}` : ''; };
  const when = (e) => (e.dateEnd && e.dateEnd !== e.date ? `${fd(e.date)} → ${fd(e.dateEnd)}` : fd(e.date)) + (e.time ? ' · ' + e.time : '');
  const money = (n, cur) => new Intl.NumberFormat('fr-FR').format(n) + ' ' + (cur || 'Ar');
  const API = C.vitrineUrl ? C.vitrineUrl.replace(/\/$/, '') : '';
  let data = { events: [], news: [], banners: [], packages: [], currency: 'Ar' }, cat = '';

  function card(e) {
    return `<button class="evc${e.featured ? ' feat' : ''}" data-id="${e.id}"><div class="im" ${e.img ? `style="background-image:url('${img(e.img)}')"` : ''}>${e.featured ? '<span class="tag">À la une</span>' : ''}</div>
      <div class="tx"><span class="dt">${esc(when(e))}</span><h3>${esc(e.title)}</h3><span class="meta">${esc([e.venue, e.city].filter(Boolean).join(' · '))}</span>${e.price ? `<span class="pr">${esc(e.price)}</span>` : ''}</div></button>`;
  }
  function drawEvents() {
    const all = data.events;
    $('#evenements').hidden = !all.length; $('#mEv').hidden = !all.length;
    if (!all.length) return;
    const cats = [...new Set(all.map((e) => e.category).filter(Boolean))];
    $('#evCats').innerHTML = cats.length > 1 ? [''].concat(cats).map((c) => `<button data-c="${esc(c)}" class="${c === cat ? 'on' : ''}">${c ? esc(c) : 'Tous'}</button>`).join('') : '';
    $$('#evCats button').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.c; drawEvents(); }));
    const list = all.filter((e) => !cat || e.category === cat);
    const feat = list.filter((e) => e.featured);
    $('#evFeat').innerHTML = feat.map(card).join('');
    $('#evGrid').innerHTML = list.filter((e) => !e.featured).map(card).join('');
    $$('.evc').forEach((b) => b.addEventListener('click', () => openEv(+b.dataset.id)));
  }
  function openEv(id) {
    const e = data.events.find((x) => x.id === id); if (!e) return;
    let act = '';
    if (e.booking === 'lien' && e.link) act = `<a class="btn" href="${esc(e.link)}" target="_blank" rel="noopener">Réserver</a>`;
    else if (e.booking === 'billetterie') act = '<div id="shop"></div>';
    else if (e.booking === 'whatsapp') act = `<div class="row"><div><label>Votre nom</label><input id="rvN" autocomplete="name"></div><div><label>Téléphone</label><input id="rvT" inputmode="tel" autocomplete="tel"></div><div><label>Nombre de places</label><input id="rvQ" type="number" min="1" value="1"></div></div><button class="btn" id="rvGo">Réserver sur WhatsApp</button><div id="rvE" class="mut" style="margin-top:8px;color:#ff9aa8"></div>`;
    $('#evBody').innerHTML = `${e.img ? `<img src="${img(e.img)}" alt="${esc(e.title)}">` : ''}<span class="dt" style="color:var(--orange);font-weight:800">${esc(when(e))}</span><h3>${esc(e.title)}</h3>
      <div class="mut">${esc([e.venue, e.city].filter(Boolean).join(' · '))}</div>${e.price ? `<p><b>${esc(e.price)}</b></p>` : ''}<p class="desc">${esc(e.description)}</p>${e.organizer ? `<p class="mut">Organisé par ${esc(e.organizer)}</p>` : ''}${act}`;
    $('#evModal').hidden = false;
    if (e.booking === 'billetterie') shop(e);
    const go = $('#rvGo');
    if (go) go.addEventListener('click', () => {
      const n = $('#rvN').value.trim(), t = $('#rvT').value.trim(), q = Math.max(1, parseInt($('#rvQ').value, 10) || 1);
      if (!n) { $('#rvE').textContent = 'Indiquez votre nom.'; return; }
      if (!/\d{6,}/.test(t.replace(/\D/g, ''))) { $('#rvE').textContent = 'Indiquez un numéro de téléphone valide.'; return; }
      const to = (e.phone || '').replace(/\D/g, '') || C.whatsapp;
      const msg = ['*Réservation — ' + e.title + '*', `Évènement : ${e.title}`, `Date : ${fd(e.date)}`, `Nom : ${n}`, `Téléphone : ${t}`, `Quantité : ${q}`].join('\n');
      window.open(wa(to, msg), '_blank', 'noopener');
    });
  }

  /* ---------- billetterie : choix des billets, commande, paiement mobile money ---------- */
  const MM = [['mvola', 'MVola'], ['orange', 'Orange Money'], ['airtel', 'Airtel Money']];
  const payHtml = (p) => { const l = MM.filter(([k]) => p && p[k]).map(([k, n]) => `<li><b>${n}</b> : ${esc(p[k])}</li>`).join(''); return l ? `<ul class="payl">${l}</ul>${p.holder ? `<div class="mut">Au nom de ${esc(p.holder)}</div>` : ''}${p.note ? `<div class="mut">${esc(p.note)}</div>` : ''}` : '<p class="mut">L\'organisateur vous communiquera le numéro de paiement.</p>'; };
  async function shop(e) {
    const box = $('#shop'); let tickets = e.tickets || [], pay = data.pay || {};
    if (API) { try { const r = await fetch(`${API}/events/${e.id}/tickets`); if (r.ok) { const j = await r.json(); tickets = j.tickets; pay = j.pay; } } catch (x) { /* instantané du site */ } }
    if (!tickets.length) { box.innerHTML = '<p class="mut">Les billets seront bientôt disponibles.</p>'; return; }
    box.innerHTML = `<div class="tkl">${tickets.map((t) => `<div class="tkr"><div><b>${esc(t.name)}</b><div class="mut">${money(t.price, data.currency)}${t.closed ? ' · vente terminée' : ''}</div></div>${t.left > 0 ? `<input type="number" min="0" max="${Math.min(10, t.left)}" value="0" data-t="${t.id}" aria-label="Quantité ${esc(t.name)}">` : '<span class="soldout">Complet</span>'}</div>`).join('')}</div>
      <div class="row"><div><label>Votre nom</label><input id="shN" autocomplete="name"></div><div><label>Téléphone (WhatsApp)</label><input id="shT" inputmode="tel" autocomplete="tel"></div></div>
      <div class="tot">Total : <b id="shTot">0 Ar</b></div><button class="btn" id="shGo">${API ? 'Commander' : 'Réserver sur WhatsApp'}</button><div id="shE" style="margin-top:8px;color:#ff9aa8"></div>`;
    const lines = () => $$('[data-t]', box).map((i) => { const t = tickets.find((x) => x.id === +i.dataset.t); return { t, qty: Math.max(0, Math.min(+i.max, parseInt(i.value, 10) || 0)) }; }).filter((l) => l.qty > 0);
    const upd = () => { $('#shTot').textContent = money(lines().reduce((a, l) => a + l.t.price * l.qty, 0), data.currency); };
    $$('[data-t]', box).forEach((i) => i.addEventListener('input', upd));
    $('#shGo').addEventListener('click', async () => {
      const er = $('#shE'), n = $('#shN').value.trim(), ph = $('#shT').value.trim(), ls = lines();
      if (!ls.length) { er.textContent = 'Choisissez au moins un billet.'; return; }
      if (!n) { er.textContent = 'Indiquez votre nom.'; return; }
      if (!/\d{9,}/.test(ph.replace(/\D/g, ''))) { er.textContent = 'Indiquez un numéro de téléphone valide.'; return; }
      er.textContent = '';
      if (!API) {
        const to = (e.phone || '').replace(/\D/g, '') || C.whatsapp;
        const msg = ['*Réservation — ' + e.title + '*', `Évènement : ${e.title}`, `Date : ${fd(e.date)}`].concat(ls.map((l) => `Billet : ${l.t.name} × ${l.qty}`), [`Nom : ${n}`, `Téléphone : ${ph}`, `Total : ${money(ls.reduce((a, l) => a + l.t.price * l.qty, 0), data.currency)}`]).join('\n');
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
  function done(box, j, ph) {
    box.innerHTML = `<div class="okb"><h4>Commande ${esc(j.ref)} enregistrée</h4><p>Vos places sont bloquées pendant 24 h. Envoyez <b>${money(j.total, data.currency)}</b> par mobile money :</p>${payHtml(j.pay)}
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
      try { const r = await fetch(`${API}/orders/${j.ref}?phone=${encodeURIComponent(ph)}`); const o = await r.json(); if (!r.ok) throw new Error(o.error); msg(st[o.status] || o.status, o.status === 'refusee' || o.status === 'expiree'); } catch (x) { msg(x.message || 'Erreur', true); }
    });
  }
  const close = () => { $('#evModal').hidden = true; };
  $('#evX').addEventListener('click', close);
  $('#evModal').addEventListener('click', (ev) => { if (ev.target.id === 'evModal') close(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); });

  function drawNews() {
    $('#actus').hidden = !data.news.length; $('#mNews').hidden = !data.news.length;
    $('#newsGrid').innerHTML = data.news.map((n) => `<article class="nw">${n.img ? `<div class="im" style="background-image:url('${img(n.img)}')"></div>` : ''}<div class="tx"><span class="mut" style="font-size:13px">${esc(fd(n.date))}</span>${n.sponsored ? `<span class="tag">Sponsorisé${n.sponsor ? ' · ' + esc(n.sponsor) : ''}</span>` : ''}<h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${/^https?:\/\//.test(n.link || '') ? `<p><a href="${esc(n.link)}" target="_blank" rel="noopener${n.sponsored ? ' sponsored' : ''}">En savoir plus →</a></p>` : ''}</div></article>`).join('');
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
  }).catch(() => { /* pas de données : les sections restent masquées */ });
})();
