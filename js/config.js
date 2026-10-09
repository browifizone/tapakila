/* ====== À MODIFIER ICI SEULEMENT ====== */
window.TAPAKILA_SITE = {
  whatsapp: '261388795783',          // numéro WhatsApp principal (format international sans +)
  whatsapp2: '261329767166',         // second numéro
  phone1: '038 87 957 83',
  phone2: '032 97 671 66',
  email: 'arogerald@gmail.com',
  // Facultatif : réception automatique par e-mail via un service de formulaire gratuit
  // (ex. Web3Forms : https://web3forms.com -> collez votre clé d'accès ci-dessous). Laisser vide = WhatsApp / e-mail seulement.
  web3formsKey: '',
  defaultTheme: 'blue',              // 'blue' (bleu nuit) ou 'red' (rouge nuit) — thème d'ouverture du site
  facebook: '',                      // plus tard : https://facebook.com/...
};

// Vitrine (évènements, actualités, publicités). Par défaut : fichiers publiés dans data/ (paquet exporté depuis le logiciel).
// Option « direct » : mettre ici l'adresse publique du logiciel, ex. 'https://mon-serveur.example/public' pour un site toujours à jour.
window.TAPAKILA_SITE.vitrineUrl = '';   // vide = data/vitrine.json. Renseigné : le site lit en direct ET active la commande en ligne (billetterie)
window.TAPAKILA_SITE.imgBase = '';      // vide = data/img/
