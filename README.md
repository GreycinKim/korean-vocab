# 한국어 Vocab

Korean vocabulary learning app with Structure Lab (AI grammar), flashcards, and a word library.

## Local development

```bash
npm install
cp .env.example .env
# Edit .env — set VITE_OPENAI_API_KEY and Supabase vars for cloud sync
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Deploy

This is a Vite + React static site. Pick **Vercel** or **Netlify**.

### Environment variables

In your host’s dashboard, add:

| Name | Value |
|------|--------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key (Structure Lab + voice) |
| `VITE_SUPABASE_URL` | Supabase project URL (cloud sync) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (cloud sync) |

Vite bakes `VITE_*` variables into the build at **build time**, so set these before deploying (or redeploy after changing them).

### Cloud sync (Supabase)

Vocab, folders, and study settings sync when you sign in with email (magic link).

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run the script in `supabase/schema.sql`.
3. **Authentication** → enable Email provider.
4. **Authentication** → URL configuration → add your site URL (e.g. `http://localhost:5173` and your Vercel URL) under **Redirect URLs**.
5. **Project Settings** → **API** → copy **Project URL** and **anon public** key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. In the app header, click **Sync** → enter email → open the link from your inbox.

Sync uses last-updated wins if you edit on two devices offline; sign in and use **Sync now** if needed.

> **Security:** The key is included in the client JavaScript bundle. Use a separate key with usage limits, and only deploy for personal learning—not a public production API.

### Option A — Vercel (recommended)

1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Add environment variables (`VITE_OPENAI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Deploy.

`vercel.json` is already configured for SPA routing.

CLI:

```bash
npm i -g vercel
vercel
# Follow prompts; add VITE_OPENAI_API_KEY when asked
```

### Option B — Netlify

1. Push to GitHub.
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Build command: `npm run build`  
   Publish directory: `dist`
4. **Site settings → Environment variables** → add OpenAI + Supabase vars.
5. Deploy.

`netlify.toml` and `public/_redirects` handle client-side routes.

### After deploy

- Vocab syncs to Supabase when signed in; `localStorage` is also used as a local cache.
- Test Structure Lab on your phone; the bottom tab bar works on narrow screens.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
