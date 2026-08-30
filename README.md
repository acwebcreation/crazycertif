# CrazyCertif

Certificats et diplômes absurdes personnalisés, format A4 PDF.

## Structure

```
public/
  index.html          Page galerie : choix du pack (5€/12€) + choix des styles
  personalize.html     Page de personnalisation (après paiement)
  app.js                Logique de la galerie + démarrage du paiement Stripe
  personalize.js        Logique du formulaire + aperçu live + envoi pour génération PDF
  styles.css            Styles partagés

src/data/
  content.js             Source unique : 5 catégories, 30 titres, phrases, 6 styles
  renderTemplate.js       Génère le SVG d'un certificat (style + contenu) —
                          utilisé à la fois par l'aperçu navigateur et le PDF serveur

netlify/functions/
  create-checkout.js      Crée la session Stripe Checkout (5€ ou 12€)
  verify-session.js       Vérifie qu'une session est payée avant de débloquer la perso
  generate-pdf.js          Re-vérifie le paiement, régénère les SVG, exporte en PDF A4
  download-pdf.js          Sert le PDF stocké 24h
```

## Logique clé : paiement avant personnalisation

1. Le client choisit 1 ou 3 styles visuels sur `index.html` → paiement Stripe
2. Redirection vers `personalize.html?session=...`
3. `verify-session.js` confirme le paiement et renvoie les styles achetés
4. Le client personnalise chaque certificat (catégorie → titre → phrase → prénom → date),
   totalement indépendant du style déjà payé
5. `generate-pdf.js` re-vérifie le paiement côté serveur (jamais confiance dans le client),
   régénère les SVG à partir de `renderTemplate.js`, exporte en PDF A4 via Puppeteer
6. Lien de téléchargement (24h) + email optionnel

## À brancher avant mise en prod

- Variables d'environnement : `STRIPE_SECRET_KEY`, `SITE_URL`
- Un vrai service d'email (Resend/Postmark) dans `generate-pdf.js` si `email` est fourni
- Netlify Blobs (ou S3) pour le stockage temporaire des PDF — déjà câblé via `@netlify/blobs`
- Remplacer les polices `Georgia`/`Courier New`/`Arial` par des web fonts si besoin d'un rendu identique sur tous les serveurs Puppeteer
- Ajouter les 6 gabarits comme vrais SVG définitifs si le design évolue par rapport aux maquettes

## Étendre le catalogue

Pour ajouter une catégorie ou un style : tout se passe dans `src/data/content.js`
(catégories/titres/phrases) et `src/data/renderTemplate.js` (nouveau style visuel).
Aucune autre page n'a besoin d'être modifiée — tout est généré dynamiquement depuis ces fichiers.
