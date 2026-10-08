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
