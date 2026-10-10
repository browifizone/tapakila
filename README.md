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

## Mode d'emploi — mode « paquet » (recommandé pour débuter)

Ici le site ne communique jamais avec votre PC : il est statique, et votre logiciel reste fermé à internet.
`vitrineUrl` dans `js/config.js` doit rester **vide**.

**Publier ou mettre à jour les évènements**
1. Logiciel Tapakila → *Vitrine & pubs* → vérifiez que les évènements sont « publiés » → *Publier sur le site* → **Télécharger le paquet du site**.
2. Dézippez, puis remplacez le dossier `data` du site par celui du paquet.
3. Mettez en ligne : `git add . && git commit -m "Mise à jour" && git push` (Vercel republie tout seul en une minute).
4. Ouvrez le site et vérifiez qu'un évènement s'affiche avec ses billets.

**Recevoir une commande de billets**
1. Le client choisit ses billets sur le site → WhatsApp s'ouvre avec le message prêt → il l'envoie.
2. Dans le logiciel : *Vitrine & pubs* → *Réservations* → **Saisir / coller un message** → collez le message : l'évènement, le nom, le téléphone et les billets se remplissent seuls.
3. Le client paie par mobile money (numéros affichés sur le site). Vous vérifiez la réception, puis **Valider** : les billets numériques (QR) sont créés.
4. Envoyez-lui son lien « Mon billet » (bouton de la réservation validée) par WhatsApp. **Contrôlez que la référence de transaction n'a pas déjà servi pour une autre commande.**

**À retenir**
- Le stock affiché sur le site est celui du **dernier paquet publié** : republiez après chaque vente importante, ou avant une grosse affluence.
- Ne partagez jamais l'adresse du logiciel (`http://…:5757`) sur internet ; elle ne sert qu'au PC et au Wi-Fi de l'évènement.
- Pour que l'aperçu d'un lien partagé (WhatsApp, Facebook) affiche une image, remplacez dans `index.html` la ligne `og:image` par l'adresse complète de votre site, par exemple `https://votre-site.vercel.app/img/ex/concert.webp`.

## Évènements, actualités et publicités (vitrine)

Le site affiche le contenu de `data/vitrine.json` (images dans `data/img/`). Les sections « Évènements », « Actualités » et la bannière n'apparaissent que s'il y a du contenu publié.

**Mise à jour** : dans le logiciel Tapakila → *Vitrine & pubs* → *Publier sur le site* → « Télécharger le paquet du site ». Dézippez dans le dossier du site (le dossier `data` est remplacé), puis `git add . && git commit -m "Mise à jour" && git push`.

**Mode direct (facultatif)** : si le logiciel est joignable sur internet, renseignez `vitrineUrl` dans `js/config.js` (ex. `https://mon-serveur/public`) : le site lit alors les données en direct, sans paquet.

La réservation d'un évènement ouvre WhatsApp avec un message prérempli (numéro de l'organisateur, sinon celui de Tapakila) ou un lien externe.

## Billetterie en ligne (étape 2, cœur)

- Dans le logiciel : *Vitrine & pubs* → évènement en mode « Vente de billets en ligne » → bouton **Billets** (types, prix, quantité, date limite) ; **Réservations** → numéros de paiement MVola / Orange Money / Airtel Money et file de validation.
- **Sans hébergement** (site statique seul) : le client choisit ses billets, un message WhatsApp prérempli part vers l'organisateur ; dans le logiciel, *Réservations → Saisir / coller un message* lit ce message. Le stock affiché est celui du dernier paquet publié.
- **Avec le logiciel en ligne** : renseignez `vitrineUrl` dans `js/config.js` (ex. `https://mon-serveur/public`). Le client commande directement, voit les numéros de paiement et la référence, saisit sa référence de transaction ; vous validez dans le logiciel. Le stock est en direct, les places sont bloquées 24 h.

## Aperçu du billet (formulaire de devis)

Choisir un format dans « Dimension » affiche un billet à l'échelle (avec le nom et la date saisis), son format en mm et le nombre de billets par feuille A4. Les formats viennent de *Tarifs & formats* du logiciel : ils sont inclus dans le paquet du site (`formats` dans `data/vitrine.json`). Sans paquet, la liste par défaut du site est utilisée. « Autre » demande largeur et hauteur.
