# Veillo

App de cybersécurité personnelle grand public : surveillance de fuites de données, score de vulnérabilité, recommandations concrètes.

## En ligne

- Frontend : https://veillo-cyb.vercel.app
- Backend : https://veillo.onrender.com

Déployé pour un usage privé (tests entre proches) — le backend Render gratuit se met en veille après inactivité (premier appel plus lent, ~20-30s), et les comptes sont stockés dans un fichier JSON donc peuvent être perdus à chaque redéploiement du backend.

## Lancer le projet en local

### 1. Backend
```
cd backend
npm install
npm run dev
```
Le serveur tourne sur http://localhost:3001

### 2. Frontend
Dans un autre terminal :
```
cd frontend
npm install
npm run dev
```
L'app tourne sur http://localhost:5173

## État actuel
Les données de fuites sont mockées dans `backend/src/analyzer.js`.
Pour brancher la vraie API HaveIBeenPwned, il suffira de modifier
la fonction `fetchBreaches()` dans ce fichier — tout le reste
(scoring, recommandations, interface) reste inchangé.

## Prochaines étapes
- Brancher la vraie API HaveIBeenPwned
- Remplacer le stockage JSON par une vraie base de données
- Stripe pour les plans Pro/Famille
- Email de confirmation, alertes de fuite, page 404, responsive mobile
