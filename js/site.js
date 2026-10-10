(function () {
  const C = window.TAPAKILA_SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wa = (n, t) => `https://wa.me/${n}${t ? '?text=' + encodeURIComponent(t) : ''}`;
  const hello = "Bonjour, je souhaite un devis pour des billets personnalisés (Tapakila).";
  $('#heroWa').href = wa(C.whatsapp, hello); $('#fab').href = wa(C.whatsapp, hello);
  $('#dWa1').href = wa(C.whatsapp, hello); $('#dP1').textContent = C.phone1;
  $('#dWa2').href = wa(C.whatsapp2, hello); $('#dP2').textContent = C.phone2;
  $('#dTel').href = 'tel:+' + C.whatsapp; $('#dP3').textContent = C.phone1;
  $('#dMail').href = 'mailto:' + C.email; $('#dEm').textContent = C.email;
  $('#yr').textContent = new Date().getFullYear();

  /* thème : bleu nuit / rouge nuit (mémorisé) */
  const root = document.documentElement;
  $('#themeT').addEventListener('click', () => {
    const red = root.dataset.theme !== 'red'; root.dataset.theme = red ? 'red' : '';
    try { localStorage.setItem('tpk_site_theme', red ? 'red' : 'blue'); } catch (e) { /* ignoré */ }
  });

  /* menu mobile */
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('#menu a').forEach((a) => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  /* apparition au défilement */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else $$('.reveal').forEach((el) => el.classList.add('in'));

  /* « Je veux ce style » -> préremplit le type d'évènement */
  $$('figure .pick').forEach((b) => b.addEventListener('click', () => {
    const t = b.closest('figure').dataset.t, sel = $('#fType');
    if ([...sel.options].some((o) => o.text === t)) sel.value = t;
    $('#contact').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#form [name=nom]').focus({ preventScroll: true }), 700);
  }));

  /* formulaire */
  const f = $('#form'), err = $('#ferr');
  function collect() {
    const d = Object.fromEntries(new FormData(f).entries());
    if (d.site) return null;                                   // anti-robot
    d.opts = $$('[name=opt]:checked', f).map((c) => c.value);
    return d;
  }
  function valid(d) {
    if (!d.nom.trim()) return 'Indiquez votre nom.';
    if (!/\d{6,}/.test(d.tel.replace(/\D/g, '') ) ) return 'Indiquez un numéro de téléphone valide (WhatsApp de préférence).';
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return "L'adresse e-mail semble incorrecte.";
    if (d.quantite && !/^\d[\d\s]*$/.test(d.quantite.trim())) return 'Le nombre de billets doit être un nombre.';
    return '';
  }
  // Format « Clé : valeur » — le logiciel Tapakila sait relire ce message (section Demandes > Coller un message)
  function message(d) {
    const L = ['*Demande de devis — Tapakila*', `Nom : ${d.nom.trim()}`, `Téléphone : ${d.tel.trim()}`];
    if (d.email) L.push(`E-mail : ${d.email.trim()}`);
    if (d.type) L.push(`Type : ${d.type}`);
    if (d.evenement) L.push(`Évènement : ${d.evenement.trim()}`);
    if (d.date) L.push(`Date : ${d.date.trim()}`);
    if (d.quantite) L.push(`Quantité : ${d.quantite.trim()}`);
    if (d.taille) L.push(`Dimension : ${d.taille}${/^Autre/.test(d.taille) && d.largeur && d.hauteur ? ` — ${d.largeur.trim()} × ${d.hauteur.trim()} mm` : ''}`);
    if (d.opts.length) L.push(`Options : ${d.opts.join(', ')}`);
    if (d.message) L.push(`Message : ${d.message.trim()}`);
    return L.join('\n');
  }
  async function backup(msg, d) {          // envoi automatique facultatif (Web3Forms), en plus de WhatsApp / e-mail
    if (!C.web3formsKey) return;
    try { await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: C.web3formsKey, subject: 'Demande de devis Tapakila — ' + d.nom, from_name: d.nom, replyto: d.email || undefined, message: msg }) }); } catch (e) { /* silencieux */ }
  }
  function go(kind) {
    err.textContent = ''; const d = collect(); if (!d) return;
    const e = valid(d); if (e) { err.textContent = e; return; }
    const msg = message(d); backup(msg, d);
    if (kind === 'wa') window.open(wa(C.whatsapp, msg), '_blank', 'noopener');
    else location.href = `mailto:${C.email}?subject=${encodeURIComponent('Demande de devis Tapakila — ' + d.nom)}&body=${encodeURIComponent(msg)}`;
    $('#fok').hidden = false;
  }
  $('#sWa').addEventListener('click', () => go('wa')); $('#sMail').addEventListener('click', () => go('mail'));
  f.addEventListener('submit', (e) => { e.preventDefault(); go('wa'); });
})();
