# Production Deployment Guide

## Overview
This guide will help you deploy your TextSummarizer application to production:
- **Frontend**: Vercel (React/Vite application)
- **Backend**: Render (Node.js API)
- **Database**: MongoDB Atlas (cloud database)

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `TextSummarizer`
4. Make it **Public** (required for free Vercel)
5. Don't initialize with README/gitignore (we have them)
6. Click "Create repository"

### 1.2 Push Your Code
After creating the repository, run these commands (replace YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/TextSummarizer.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

### 2.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `TextSummarizer` repository
4. Configure:
   - **Name**: `textsummarizer-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Set Environment Variables
In Render dashboard, go to Environment tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
FROM_EMAIL=your_from_email
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important**: You'll get the FRONTEND_URL after deploying to Vercel (Step 3)

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

```
VITE_API_URL=https://your-render-app.onrender.com
VITE_APP_NAME=TextSummarizer
VITE_APP_VERSION=1.0.0
```

**Important**: Replace `your-render-app` with your actual Render app name

## Step 4: Setup MongoDB Atlas

### 4.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account

### 4.2 Create Database
1. Create a new cluster (free tier)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all IPs)
4. Get connection string

### 4.3 Update Backend Environment
Update the `MONGODB_URI` in your Render environment variables with your Atlas connection string.

## Step 5: Final Configuration

### 5.1 Update Frontend URL in Backend
1. Go to your Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend service

### 5.2 Update Backend URL in Frontend
1. Go to your Vercel dashboard
2. Update `VITE_API_URL` environment variable with your Render URL
3. Redeploy the frontend

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration/login
3. Test text summarization
4. Test file upload
5. Test sharing functionality

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI=mongodb+srv://...`
- `GEMINI_API_KEY=your_key`
- `JWT_SECRET=your_secret`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=your_email`
- `EMAIL_PASS=your_app_password`
- `FROM_EMAIL=your_email`
- `FRONTEND_URL=https://your-app.vercel.app`

### Frontend (Vercel)
- `VITE_API_URL=https://your-app.onrender.com`
- `VITE_APP_NAME=TextSummarizer`
- `VITE_APP_VERSION=1.0.0`

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure FRONTEND_URL is correctly set in backend
2. **API not found**: Check VITE_API_URL in frontend
3. **Database connection**: Verify MongoDB Atlas IP whitelist
4. **Build failures**: Check Node.js version compatibility

### Logs
- **Render**: Check logs in Render dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **MongoDB**: Check Atlas monitoring

## Security Notes
- Never commit API keys to GitHub
- Use environment variables for all secrets
- Enable MongoDB Atlas IP whitelisting
- Use strong JWT secrets
- Enable HTTPS only in production

## Monitoring
- Set up Render health checks
- Monitor Vercel function usage
- Monitor MongoDB Atlas usage
- Set up error tracking (optional: Sentry)

Your application should now be live and accessible worldwide!
