# LearnFast

Application de bureau pour générer des quiz QCM à partir de tes cours (PDF ou image).
Propulsé par l'IA Groq (gratuit) — fonctionne en local sur Windows et macOS.

---

## Fonctionnalités

- Importe un **PDF** ou une **image** (PNG, JPG, WEBP) de cours
- Génère automatiquement un quiz QCM (choix du nombre de questions)
- Affiche les bonnes réponses avec explications
- Historique des sessions sauvegardé localement

---

## Prérequis

- [Node.js](https://nodejs.org) v18+
- Une clé API Groq gratuite → [console.groq.com](https://console.groq.com)

---

## Installation

```bash
git clone https://github.com/Manoleau/learnfast.git
cd learnfast
npm install
```

---

## Lancer en développement

```bash
npm run dev
```

---

## Build (installeur)

```bash
npm run dist
```

L'installeur `.exe` (Windows) est généré dans le dossier `release/`.

> **Note Windows :** SmartScreen peut afficher un avertissement à l'installation.
> Clique sur **"Informations supplémentaires"** → **"Exécuter quand même"**.

---

## Configuration

Au premier lancement, va dans **Paramètres** et entre ta clé API Groq (commence par `gsk_`).
La clé est stockée localement sur ta machine, elle n'est jamais envoyée ailleurs.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| Electron + electron-vite | App de bureau |
| React 19 + TypeScript | Interface |
| Tailwind CSS | Style |
| Groq SDK (Llama 3.3 / Llama 4) | Génération du quiz |
| electron-store | Persistance locale |
| pdf-parse | Extraction texte PDF |

---

## Structure du projet

```
src/
├── main/
│   ├── index.ts      # Processus principal Electron, handlers IPC
│   └── ai.ts         # Appel à l'API Groq, génération du quiz
├── preload/
│   └── index.ts      # Bridge sécurisé (window.api)
└── renderer/src/
    ├── App.tsx        # Routeur de pages
    └── pages/
        ├── Home.tsx
        ├── Quiz.tsx
        ├── Results.tsx
        └── Settings.tsx
```

---

## Licence

MIT © 2026 Emmanuel Ardoin
