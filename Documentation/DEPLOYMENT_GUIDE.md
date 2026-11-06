# HPS Tools — Free Hosting & Production Deployment Guide

HPS Tools is architected for zero cloud hosting fees. Because all 21 tools operate 100% in the user's browser, the application can be hosted on free static hosting tiers worldwide with global CDN caching.

---

## 1. Deploying to Netlify (Recommended)

Netlify provides a generous free tier with automated Git CI/CD and global CDN distribution.

### Option A: Deploy via GitHub (Continuous Deployment)
1. Push your HPS Tools repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial HPS Tools commit"
   git remote add origin https://github.com/<your-username>/hpstools.git
   git push -u origin main
   ```
2. Log into [Netlify.com](https://www.netlify.com).
3. Click **Add new site** → **Import an existing project** → **GitHub**.
4. Select your `hpstools` repository.
5. Netlify will detect the project settings automatically:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy hpstools**.

### Netlify Serverless API & SPA Routing
HPS Tools includes built-in Netlify Functions (`netlify/functions/api.ts`) and full Netlify configuration (`netlify.toml` and `public/_redirects`).

1. **API Requests**: `/api/*` requests are automatically routed to the serverless API handler (`/.netlify/functions/api/:splat`), providing full user registration, login, session tokens, feedback, and admin endpoints.
2. **Client SPA Routing**: All user-facing routes (e.g. `/tools/calculator`, `/admin`, `/about`) are served by `/index.html`:
```text
/api/*    /.netlify/functions/api/:splat    200
/*        /index.html                       200
```
When Vite builds into `dist`, this file is automatically placed at `dist/_redirects`, ensuring both API endpoints and SPA navigation work seamlessly with zero 404 or JSON parse errors.

---

## 2. Deploying to Vercel

1. Install the Vercel CLI or connect your Git repository at [Vercel.com](https://vercel.com):
   ```bash
   npm i -g vercel
   vercel
   ```
2. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.

---

## 3. Deploying to GitHub Pages

1. In `vite.config.ts`, if your GitHub Pages repository is hosted at `https://<username>.github.io/<repo-name>/`, set:
   ```ts
   base: '/<repo-name>/',
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Copy `dist/index.html` to `dist/404.html` so GitHub Pages routes all paths to your React SPA:
   ```bash
   cp dist/index.html dist/404.html
   ```
4. Push the `dist` folder to your `gh-pages` branch.

---

## 4. Deploying to Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Workers & Pages**.
2. Click **Create application** → **Pages** → **Connect to Git**.
3. Build configuration:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy!

---

## 5. Full-Stack Node.js / Docker Deployment

If you want to host the Express backend alongside the static bundle:

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Run the Express server:
   ```bash
   node server.ts
   ```
   Or using tsx:
   ```bash
   npm start
   ```
3. Expose port 3000 behind Nginx, Caddy, or a Cloud Run / VPS reverse proxy.
