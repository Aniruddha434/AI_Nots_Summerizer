# Deployment Checklist

## Pre-Deployment
- [x] Code committed to git
- [x] .gitignore configured
- [x] Environment variables documented
- [x] Deployment configurations ready (vercel.json, render.yaml)

## GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify all files are uploaded

## Backend Deployment (Render)
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Configure build/start commands
- [ ] Add all environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] MONGODB_URI
  - [ ] GEMINI_API_KEY
  - [ ] JWT_SECRET
  - [ ] EMAIL_HOST
  - [ ] EMAIL_PORT
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASS
  - [ ] FROM_EMAIL
  - [ ] FRONTEND_URL (add after Vercel deployment)
- [ ] Deploy and verify backend is running
- [ ] Test health endpoint: `https://your-app.onrender.com/health`

## Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure framework as Vite
- [ ] Add environment variables:
  - [ ] VITE_API_URL (your Render backend URL)
  - [ ] VITE_APP_NAME=TextSummarizer
  - [ ] VITE_APP_VERSION=1.0.0
- [ ] Deploy and verify frontend is running

## Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster (free tier)
- [ ] Create database user
- [ ] Whitelist IP addresses (0.0.0.0/0)
- [ ] Get connection string
- [ ] Update MONGODB_URI in Render

## Final Configuration
- [ ] Update FRONTEND_URL in Render with Vercel URL
- [ ] Redeploy backend service
- [ ] Update VITE_API_URL in Vercel with Render URL
- [ ] Redeploy frontend

## Testing
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Text summarization works
- [ ] File upload works
- [ ] Sharing functionality works
- [ ] Email notifications work (if configured)

## URLs to Save
- GitHub Repository: `https://github.com/YOUR_USERNAME/TextSummarizer`
- Frontend (Vercel): `https://your-app.vercel.app`
- Backend (Render): `https://your-app.onrender.com`
- Database: MongoDB Atlas cluster

## Post-Deployment
- [ ] Test all functionality
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts (optional)
- [ ] Document any issues and solutions

## Quick Commands Reference

### Push to GitHub (after creating repository)
```bash
git remote add origin https://github.com/YOUR_USERNAME/TextSummarizer.git
git push -u origin main
```

### Test Backend Health
```bash
curl https://your-app.onrender.com/health
```

### Test Frontend
Open browser: `https://your-app.vercel.app`

## Support
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
