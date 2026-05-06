# WD MyCloud Setup Guide for Casiopony

This guide will help you configure your WD MyCloud to store Casiopony audio files.

---

## Part 1: Prepare Your WD MyCloud (20 minutes)

### Step 1: Access WD MyCloud Web Interface

1. On your home network, open a web browser
2. Go to: `http://mycloud.local` 
   - Or find your WD MyCloud IP address (check your router)
   - Example: `http://192.168.1.50`
3. Log in with your WD MyCloud username/password

---

### Step 2: Create a Folder for Casiopony

1. In the web interface, navigate to **"Shares"** or **"Files"**
2. Create a new folder:
   - Name: `Casiopony`
3. Inside that folder, create another:
   - Name: `Recordings`
4. Full path: `MyCloudShares/Casiopony/Recordings/`

---

### Step 3: Enable Network Access (SMB/NFS)

The app needs to access your WD MyCloud over the network.

1. Go to **Settings** → **Network** or **File Sharing**
2. Look for **SMB (Samba)** or **NFS** option
3. Enable it (check the box)
4. Save settings
5. Your WD MyCloud will restart briefly

---

### Step 4: Get Your WD MyCloud Network Path

You'll need this for Railway configuration.

**If you know your WD MyCloud IP address (e.g., 192.168.1.50):**
```
//192.168.1.50/Casiopony/Recordings
```

**If using hostname:**
```
//mycloud.local/Casiopony/Recordings
```

**On Linux/Mac (if mounting):**
```
/mnt/MyCloudShares/Casiopony/Recordings
```

**Keep this path – you'll need it later!**

---

## Part 2: Configure Railway (10 minutes)

### Step 1: Add Environment Variable

When you deploy to Railway, you'll set an environment variable.

1. Go to Railway dashboard
2. Click on your backend service
3. Go to **"Variables"** tab
4. Add a new variable:
   - **Name**: `MYCLOUD_PATH`
   - **Value**: The network path from Part 1, Step 4
   - Example: `//192.168.1.50/Casiopony/Recordings`

5. Click "Add"

---

### Step 2: Important Note About Network Access

**Railway (cloud) → Your Home WD MyCloud Connection:**

This is tricky because Railway is in the cloud, and your WD MyCloud is at home.

**For this to work:**
- Your WD MyCloud must be accessible from the internet
- OR you need to use a VPN/tunnel
- OR the app must run on your local network (not Railway)

---

## Part 3: Choose Your Setup

You have three options:

### Option A: Railway Backend + Local WD MyCloud (Won't Work)
❌ **Problem:** Railway can't access your home network directly

### Option B: Run Backend Locally + WD MyCloud (Works, But Limited)
✅ **Works if:** You run the Node.js backend on your home computer
- Pro: Direct access to WD MyCloud
- Con: Your computer must be on 24/7
- Con: Only accessible when home computer is running

### Option C: Use Railway + Upgrade Storage (Easiest)
✅ **Works best if:** You accept the $5-10/month Railway storage upgrade
- Pro: App always works
- Pro: Accessible from anywhere
- Con: Small cost

### Option D: Self-Hosted Backend (Advanced)
✅ **Works if:** You're technical
- Pro: Full control
- Con: Complex setup

---

## Recommendation: Option B (Run Backend Locally)

**For a free solution with WD MyCloud, Option B is best:**

1. **Keep Netlify frontend** (free, hosted in cloud)
2. **Run backend on your home computer** (free)
3. **Connect to WD MyCloud** (direct access, works great)

---

## If You Choose Option B: Running Backend Locally

### Requirements:
- Node.js installed on your computer
- Computer must be on when band members use the app
- Home internet access from outside your network (might need port forwarding)

### Setup:

1. **Install Node.js** (if not already)
   - Go to nodejs.org
   - Download and install

2. **Clone your backend code**
   ```bash
   git clone https://github.com/YOUR-USERNAME/band-app-backend.git
   cd band-app-backend
   npm install
   ```

3. **Create .env file** (in backend folder)
   ```
   DATABASE_URL=postgresql://...  (from Railway PostgreSQL)
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   PORT=3000
   MYCLOUD_PATH=//192.168.1.50/Casiopony/Recordings
   ```

4. **Run migration** (first time only)
   ```bash
   node scripts/migrate.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   You should see: `🎸 Band app running on port 3000`

6. **Update Netlify frontend**
   - Set `VITE_API_URL` to your computer's IP
   - Example: `http://192.168.1.100:3000` (on home network)
   - Or use ngrok for outside access

---

## If You Choose Option C: Upgrade Railway Storage

Honestly, **just upgrade to 2 GB on Railway for $5-10/month.**

It's:
- ✅ Simple
- ✅ Always works
- ✅ Accessible anywhere
- ✅ Cheap
- ✅ No computer management

Files store on Railway's servers instead of WD MyCloud.

---

## My Recommendation

**Go with Option C (Railway with upgraded storage).**

Here's why:
- $5-10/month is reasonable for a band app
- No computer uptime requirements
- Works from anywhere
- More reliable than home network

**But if you're committed to zero cost:**
- **Option B** is doable – run backend locally
- Takes 30 mins extra setup
- Computer must stay on

---

## Summary

| Option | Cost | Complexity | Reliability | Recommendation |
|--------|------|-----------|-------------|---|
| A: Railway + WD MyCloud | $0 | Hard | Low | ❌ Don't use |
| B: Local Backend + WD MyCloud | $0 | Medium | Medium | ✅ OK if dedicated |
| C: Railway + Storage Upgrade | $5-10/mo | Easy | High | ✅ BEST |
| D: Self-hosted | $0-50 | Very Hard | Medium | ❌ Overkill |

---

## Questions?

Before you deploy, decide:
- **Option B or Option C?**

Let me know and we'll finalize the setup! 🎵
