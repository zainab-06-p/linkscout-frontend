# 🚀 Deploy LinkScout Frontend to Vercel (Free Tier)

## Prerequisites
- ✅ Backend deployed on HuggingFace: `https://zpsajst-linkscout-backend.hf.space`
- ✅ GitHub account
- ✅ Vercel account (sign up at https://vercel.com - it's FREE)

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Create GitHub Repository for Frontend

1. Go to GitHub: https://github.com/new
2. Create a new repository:
   - **Repository name**: `linkscout-frontend`
   - **Description**: `LinkScout Web Interface - Smart Analysis. Simple Answers.`
   - **Visibility**: Public or Private (your choice)
   - **DON'T** initialize with README, .gitignore, or license (we already have them)
3. Click **"Create repository"**

### Step 2: Push Frontend Code to GitHub

Open PowerShell in the frontend directory and run:

```powershell
# Navigate to frontend directory
cd D:\LinkScout\web_interface\LinkScout

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - LinkScout frontend ready for deployment"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/linkscout-frontend.git

# Push to GitHub
git push -u origin main
```

**Example with actual username:**
```powershell
git remote add origin https://github.com/zainab-06-p/linkscout-frontend.git
git push -u origin main
```

### Step 3: Deploy on Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. **Import your GitHub repository**:
   - Find `linkscout-frontend` in the list
   - Click **"Import"**
5. **Configure the project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
6. **Environment Variables** (CRITICAL):
   Click **"Environment Variables"** and add:
   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://zpsajst-linkscout-backend.hf.space
   ```
7. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd D:\LinkScout\web_interface\LinkScout
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? linkscout-frontend
# - Directory? ./ (press Enter)
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_BACKEND_URL production
# When prompted, paste: https://zpsajst-linkscout-backend.hf.space

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

After deployment completes (2-3 minutes), Vercel will give you a URL like:
```
https://linkscout-frontend.vercel.app
```

**Test your deployed frontend:**
1. Go to your Vercel URL
2. Click on **"Try LinkScout"** or navigate to `/search`
3. Enter some text to analyze (e.g., "Breaking news: Scientists found alien life!")
4. Click **"Analyze"**
5. You should see results from your HuggingFace backend!

### Step 5: (Optional) Add Custom Domain

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (if you have one)
4. Follow Vercel's instructions to update DNS records

---

## 🎯 What Happens After Deployment

### Automatic Features:
- ✅ **Auto-deployments**: Every `git push` to `main` auto-deploys
- ✅ **HTTPS**: Free SSL certificate
- ✅ **CDN**: Global edge network (super fast)
- ✅ **Preview deployments**: Each PR gets a preview URL
- ✅ **Zero config**: Next.js detected automatically

### Your Live URLs:
- **Backend**: https://zpsajst-linkscout-backend.hf.space
- **Frontend**: https://linkscout-frontend.vercel.app (or your custom domain)

---

## 🔧 Troubleshooting

### Issue: "Backend offline" error
**Solution**: Make sure you added environment variable in HuggingFace:
1. Go to https://huggingface.co/spaces/zpsajst/linkscout-backend/settings
2. Add `GROQ_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_CSE_ID`
3. Restart the Space

### Issue: Build fails on Vercel
**Solution**: Check build logs in Vercel Dashboard
- Common fix: Make sure `package.json` has correct dependencies
- Run `npm install` locally first to verify

### Issue: CORS errors
**Solution**: Backend already has CORS enabled for all origins, should work fine

### Issue: API not found (404)
**Solution**: Verify `NEXT_PUBLIC_BACKEND_URL` environment variable in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_BACKEND_URL` = `https://zpsajst-linkscout-backend.hf.space`
3. Redeploy: Settings → Deployments → Click ⋯ → Redeploy

---

## 🎉 Success Checklist

- [ ] Backend deployed on HuggingFace ✅
- [ ] Backend API keys added ✅
- [ ] Frontend code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variable added (`NEXT_PUBLIC_BACKEND_URL`)
- [ ] Frontend deployed successfully
- [ ] Test analysis working end-to-end
- [ ] Custom domain added (optional)

---

## 📊 Free Tier Limits

**Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Unlimited websites
- ✅ HTTPS included
- ✅ No credit card required

**HuggingFace Spaces Free Tier:**
- ✅ 16GB RAM
- ✅ 2 vCPU
- ✅ 50GB storage
- ✅ Always-on (with activity)

---

## 🚀 Next Steps

After deploying both backend and frontend:

1. **Test thoroughly**: Try different types of content
2. **Share the URL**: Your LinkScout is now globally accessible!
3. **Deploy Chrome Extension**: See `/extension` folder for instructions
4. **Monitor usage**: Check Vercel Analytics and HF Spaces logs

---

## 💡 Pro Tips

1. **Environment Variables**: Always use `NEXT_PUBLIC_` prefix for client-side env vars
2. **Git Workflow**: Push to `main` branch for auto-deployment
3. **Preview URLs**: Push to feature branches to get preview deployments
4. **Logs**: Check Vercel Functions logs for debugging API routes
5. **Performance**: Vercel automatically optimizes images and static assets

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **HuggingFace Docs**: https://huggingface.co/docs/hub/spaces

Your LinkScout is ready to go global! 🌍✨
