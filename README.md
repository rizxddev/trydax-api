# TryDax API — REST API for WhatsApp & Telegram Bot

A production-ready REST API project with an API Key system based on IP address, rate limiting, and various tools for bot development.

## 🚀 Features
- **Auto-generate API Key**: 1 IP = 1 Key (No login/register).
- **Rate Limiting**: 200 requests/hour per API Key.
- **Tools**: AI Chat (Gemini), TTS, Downloader, Sticker Maker, OCR.
- **Aesthetic Landing Page**: Dark terminal theme with code examples.

---

## 🛠️ Deployment Guide (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: TryDax API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trydax-api.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Import your `trydax-api` repository.
4. Click **Deploy**.

### 3. Setup Vercel KV (Redis)
1. In your Vercel Project, go to the **Storage** tab.
2. Click **Create Database** -> **KV**.
3. Once created, go to the **.env.local** tab in the KV dashboard.
4. Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

### 4. Set Environment Variables
Go to **Settings** -> **Environment Variables** and add:
- `KV_REST_API_URL`: (from step 3)
- `KV_REST_API_TOKEN`: (from step 3)
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 5. Custom Domain
1. Go to **Settings** -> **Domains**.
2. Add `api.trydax.xyz`.
3. Set CNAME record in your DNS provider:
   - Name: `api`
   - Value: `cname.vercel-dns.com`

---

## 📂 Project Structure
- `/api`: API Handlers (Key, Validate).
- `/api/tools`: Tool Handlers (AI, TTS, DL, etc.).
- `/lib`: Middleware and Store helpers.
- `/public`: Landing page assets.
- `server.ts`: Entry point for Express.

---

## 🤖 Bot Examples

### WhatsApp (Baileys)
See `bot-wa.js` for a complete implementation.

### Telegram (grammy)
See `bot-tg.js` for a complete implementation.

---

## 📝 License
Apache-2.0
