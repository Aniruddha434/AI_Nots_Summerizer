# Deployment Guide

This guide covers deploying the AI Meeting Notes Summarizer to various cloud platforms.

## Frontend Deployment

### Vercel (Recommended)

1. **Connect Repository**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**

   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**

   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_APP_NAME=AI Meeting Notes Summarizer
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-app.vercel.app`

### Netlify

1. **Connect Repository**

   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your repository
   - Set base directory to `frontend`

2. **Build Settings**

   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_APP_NAME=AI Meeting Notes Summarizer
   VITE_APP_VERSION=1.0.0
   ```

## Backend Deployment

### Render (Recommended)

1. **Connect Repository**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your repository
   - Set root directory to `backend`

2. **Configure Service**

   - Name: `ai-meeting-notes-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@yourdomain.com
   JWT_SECRET=your_strong_jwt_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Your API will be available at `https://your-service.onrender.com`

### Railway

1. **Connect Repository**

   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**

   - Railway will auto-detect Node.js
   - Set root directory to `backend` if needed

3. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FROM_EMAIL=noreply@yourdomain.com
   JWT_SECRET=your_strong_jwt_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

### Heroku

1. **Install Heroku CLI**

   ```bash
   # Install Heroku CLI
   npm install -g heroku
   ```

2. **Create Heroku App**

   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set GEMINI_API_KEY=your_gemini_api_key
   heroku config:set SENDGRID_API_KEY=your_sendgrid_api_key
   heroku config:set FROM_EMAIL=noreply@yourdomain.com
   heroku config:set JWT_SECRET=your_strong_jwt_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Database Setup

### MongoDB Atlas

1. **Create Cluster**

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier available)
   - Choose a cloud provider and region

2. **Create Database User**

   - Go to Database Access
   - Add a new database user
   - Set username and password
   - Grant read/write access

3. **Configure Network Access**

   - Go to Network Access
   - Add IP address `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs of your deployment platforms

4. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## External Services Setup

### Google Gemini API

1. **Get API Key**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for your environment variables

2. **Set Quotas**
   - Check your API quotas and limits
   - Consider upgrading if you expect high usage

### SendGrid Email Service

1. **Create Account**

   - Sign up at [SendGrid](https://sendgrid.com/)
   - Verify your account

2. **Create API Key**

   - Go to Settings → API Keys
   - Create a new API key with Mail Send permissions
   - Copy the key for your environment variables

3. **Verify Sender**
   - Go to Settings → Sender Authentication
   - Verify your sender email address
   - Use this email as your `FROM_EMAIL`

## Post-Deployment Checklist

### 1. Test API Health

```bash
curl https://your-backend-url.com/health
```

### 2. Test Frontend

- Visit your frontend URL
- Try uploading a transcript
- Generate a summary
- Test email sharing

### 3. Monitor Logs

- Check deployment platform logs for errors
- Monitor API response times
- Set up alerts for failures

### 4. Security

- Ensure all environment variables are set
- Use strong JWT secrets
- Enable HTTPS (usually automatic on platforms)
- Review CORS settings

### 5. Performance

- Monitor API response times
- Check database performance
- Consider adding caching if needed

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure `FRONTEND_URL` matches your actual frontend URL
   - Check that both services are deployed and running

2. **Database Connection Issues**

   - Verify MongoDB connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has proper permissions

3. **API Key Issues**

   - Verify all API keys are correctly set
   - Check quotas and limits
   - Ensure keys have proper permissions

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

### Getting Help

- Check platform-specific documentation
- Review application logs
- Test locally first to isolate issues
- Use the API test script: `npm run test:api`
