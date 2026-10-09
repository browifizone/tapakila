# Tapakila — site vitrine (Magicien d'Izna)

Site statique (HTML/CSS/JS) : aucune installation, aucune dépendance.

## Voir le site en local
Double-cliquez `index.html`, ou (recommandé) dans ce dossier :

    npx serve .          # ou : python -m http.server 5800

## Personnaliser
Tout se règle dans **`js/config.js`** : numéros WhatsApp, e-mail, lien Facebook (plus tard),
clé Web3Forms (facultatif : reçoit aussi chaque demande par e-mail automatiquement).

## Mettre en ligne (GitHub + Vercel)
1. `git init && git add . && git commit -m "Site Tapakila"`
2. Créez un dépôt GitHub vide puis : `git remote add origin <url> && git push -u origin main`
3. Sur vercel.com : *Add New > Project* > importez le dépôt > *Deploy* (aucun réglage : « Framework : Other »).
4. Domaine perso : Vercel > Settings > Domains.

## Recevoir les demandes (option A)
Le formulaire ouvre WhatsApp (ou le mail) avec un message structuré « Clé : valeur ».
Dans le logiciel Tapakila : **Demandes > Nouvelle demande > coller le message** → les champs se remplissent seuls
→ **Convertir en client** → **Créer la commande**.

## Évènements, actualités et publicités (vitrine)

Le site affiche le contenu de `data/vitrine.json` (images dans `data/img/`). Les sections « Évènements », « Actualités » et la bannière n'apparaissent que s'il y a du contenu publié.

**Mise à jour** : dans le logiciel Tapakila → *Vitrine & pubs* → *Publier sur le site* → « Télécharger le paquet du site ». Dézippez dans le dossier du site (le dossier `data` est remplacé), puis `git add . && git commit -m "Mise à jour" && git push`.

**Mode direct (facultatif)** : si le logiciel est joignable sur internet, renseignez `vitrineUrl` dans `js/config.js` (ex. `https://mon-serveur/public`) : le site lit alors les données en direct, sans paquet.

La réservation d'un évènement ouvre WhatsApp avec un message prérempli (numéro de l'organisateur, sinon celui de Tapakila) ou un lien externe.

## Billetterie en ligne (étape 2, cœur)

- Dans le logiciel : *Vitrine & pubs* → évènement en mode « Vente de billets en ligne » → bouton **Billets** (types, prix, quantité, date limite) ; **Réservations** → numéros de paiement MVola / Orange Money / Airtel Money et file de validation.
- **Sans hébergement** (site statique seul) : le client choisit ses billets, un message WhatsApp prérempli part vers l'organisateur ; dans le logiciel, *Réservations → Saisir / coller un message* lit ce message. Le stock affiché est celui du dernier paquet publié.
- **Avec le logiciel en ligne** : renseignez `vitrineUrl` dans `js/config.js` (ex. `https://mon-serveur/public`). Le client commande directement, voit les numéros de paiement et la référence, saisit sa référence de transaction ; vous validez dans le logiciel. Le stock est en direct, les places sont bloquées 24 h.
