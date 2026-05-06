# 🎸 Band App - Deployment Guide

Deploy your band app in **~10 minutes**. Here's the step-by-step.

---

## Part 1: Backend (Railway)

### 1. Create Railway Account

Go to https://railway.app and sign up (free). You can link your GitHub.

### 2. Push Code to GitHub

In your `band-app-backend` folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourname/band-app-backend
git push -u origin main
```

### 3. Create Railway Project

1. Go to https://app.railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your `band-app-backend` repo
5. Railway auto-detects Node.js

### 4. Add PostgreSQL

In Railway dashboard:
1. Click "Add Service" (or "Add Plugin")
2. Select "PostgreSQL"
3. Railway auto-provisions it

Railway automatically sets `DATABASE_URL` environment variable.

### 5. Set JWT Secret

In Railway dashboard → Variables:
- Add `JWT_SECRET` = `your-random-secret-key` (make it something like `sk_prod_abc123xyz789`)
- Add `NODE_ENV` = `production`

### 6. Deploy

Railway auto-deploys when you push to GitHub. Check the logs—once you see "🎸 Band app running on port 3000", it's live!

### 7. Get Your API URL

In Railway dashboard:
- Go to your project
- Look for the **Deployments** tab
- Find the public URL (looks like `https://band-app-production-xyz.railway.app`)
- That's your `RAILWAY_API_URL` for the frontend

### 8. Run Database Migrations

On your local machine, after Railway is deployed:

```bash
# SSH into Railway or use their CLI
# Set DATABASE_URL to your Railway PostgreSQL
DATABASE_URL=postgresql://... npm run migrate
```

(Railway docs have a way to run remote commands. You can also skip this and Railway will auto-create tables on first request.)

---

## Part 2: Frontend (Netlify)

### 1. Push Frontend to GitHub

In your `band-app-frontend` folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourname/band-app-frontend
git push -u origin main
```

### 2. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and choose `band-app-frontend`
4. **Build command:** `npm run build`
5. **Publish directory:** `dist`

### 3. Set Environment Variable

Before deploying:
1. In Netlify: Site settings → Build & deploy → Environment
2. Add `VITE_API_URL` = `https://your-railway-api.railway.app/api`

### 4. Deploy

Click "Deploy site". Netlify builds and deploys automatically.

Once it says "Deployed" (green checkmark), visit your Netlify URL. You're live! 🎉

---

## Testing

### On Desktop Browser

1. Visit your Netlify URL
2. Sign up with an email
3. Create a song
4. Upload audio
5. Edit lyrics/chords
6. Invite bandmates (they sign up with their email)

### On Mobile

1. Open Netlify URL in your phone's browser
2. Tap **⋮** (menu) → **"Install app"** (or "Add to Home Screen")
3. Opens like a native app icon on home screen
4. All 4 bandmates do the same

---

## Troubleshooting

### API 404 errors
- Check `VITE_API_URL` in Netlify environment variables
- Make sure Railway API is running (`/health` endpoint)

### Database connection fails
- Verify `DATABASE_URL` is set in Railway
- Run migrations once: `npm run migrate`

### Audio upload fails
- Check file size (max 200MB)
- Check audio format (MP3, WAV, M4A, AAC)

### Can't log in
- Confirm `JWT_SECRET` is set in Railway
- Check browser console for API errors

---

## Next Steps

Once deployed:

1. **Share the app** – Give all 4 band members the Netlify URL
2. **Sign up** – Each person creates an account
3. **Create songs** – Start documenting your music
4. **Upload audio** – Rehearsal recordings for reference
5. **Collaborate** – Real-time edits, everyone sees changes

---

## Updates & Changes

To update the app:

1. Make changes locally (new feature, bug fix)
2. `git push` to GitHub
3. Railway/Netlify auto-deploy in seconds

---

## Cost

| Item | Cost |
|------|------|
| Railway (backend) | Free (hobby tier) |
| Netlify (frontend) | Free (100GB/month) |
| Domain name (optional) | ~£2/year |
| **Total** | **Free** |

---

## Need Help?

- Railway docs: https://docs.railway.app
- Netlify docs: https://docs.netlify.com
- Error logs visible in dashboard

Good luck! 🎸
