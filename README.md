# 한국어 Vocab

Korean vocabulary learning app with Structure Lab (AI grammar), flashcards, and a word library.

## Local development

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_OPENAI_API_KEY
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Deploy

This is a Vite + React static site. Pick **Vercel** or **Netlify**.

### Environment variable (required for Structure Lab)

In your host’s dashboard, add:

| Name | Value |
|------|--------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key |

Vite bakes `VITE_*` variables into the build at **build time**, so set this before deploying (or redeploy after changing it).

> **Security:** The key is included in the client JavaScript bundle. Use a separate key with usage limits, and only deploy for personal learning—not a public production API.

### Option A — Vercel (recommended)

1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Add environment variable `VITE_OPENAI_API_KEY`.
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
4. **Site settings → Environment variables** → add `VITE_OPENAI_API_KEY`.
5. Deploy.

`netlify.toml` and `public/_redirects` handle client-side routes.

### After deploy

- Vocab and settings stay in the browser (`localStorage`) per device.
- Test Structure Lab on your phone; the bottom tab bar works on narrow screens.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
