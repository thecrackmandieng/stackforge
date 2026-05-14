# Otp Send Check

Projet genere automatiquement par StackForge Studio.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend Angular Web

```bash
cd frontend
npm install
npm start
```

Le backend expose les routes CRUD sous `http://localhost:3000/api`.

## Demo frontend

- Login: `dieng.tech`
- Mot de passe: `dieng123`
- OTP: demande un code par email ou SMS depuis la page de connexion.
- Page de demarrage: `/login`

## OTP email/SMS

Le backend expose:

- `POST /api/auth/request-otp` avec `{ "recipient": "email@site.com" }` ou `{ "recipient": "+221..." }`
- `POST /api/auth/verify-otp` avec `{ "recipient": "...", "code": "123456" }`

Configure `.env` pour envoyer les codes:

- Email SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- SMS Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`

Si aucun fournisseur n'est configure, le code OTP est affiche dans les logs backend en mode developpement.

## Ecrans frontend

| Ecran | Route | Description |
| --- | --- | --- |
| Connexion | `/login` | Connexion demo avec login dieng.tech, mot de passe dieng123 ou OTP envoye par email/SMS. |
| Demo | `/demo` | Vue centrale pour ouvrir tous les ecrans generes. |
| Clients | `/clients` | Ecran CRUD genere pour la table clients. |

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Verifier que le backend genere fonctionne. |
| POST | `/api/auth/request-otp` | Generer et envoyer un code OTP par email ou SMS. |
| POST | `/api/auth/verify-otp` | Verifier un code OTP envoye a un email ou telephone. |
| GET | `/api/clients` | Lister les donnees de clients. |
| GET | `/api/clients/:id` | Lire un element clients par identifiant. |
| POST | `/api/clients` | Creer un element clients. |
| PUT | `/api/clients/:id` | Modifier un element clients. |
| DELETE | `/api/clients/:id` | Supprimer un element clients. |
