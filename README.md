# ShieldMe

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
