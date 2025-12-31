# Revision App

Application de révision scolaire alimentée par l'IA (Grok) et Supabase.

## Setup

### 1. Variables d'environnement

Copiez `.env.example` (ou créez-le) en `.env.local` et remplissez les valeurs :

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
XAI_API_KEY=your-xai-api-key
\`\`\`

### 2. Base de données Supabase

Allez dans le SQL Editor de votre projet Supabase et exécutez le script contenu dans `supabase/schema.sql`.
Cela créera les tables (`courses`, `quizzes`, `performances`) et configurera les règles de sécurité (Row Level Security).

### 3. Installation et démarrage

\`\`\`bash
npm install
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement Vercel

1.  Poussez sur GitHub.
2.  Importez le projet dans Vercel.
3.  Ajoutez les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `XAI_API_KEY`).
4.  Deploy.
