# AI Meeting Notes Summarizer - Setup Guide

This guide will help you set up and run the AI Meeting Notes Summarizer application locally.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key (for Gemini)
- Gmail account (for email functionality)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment (.env)

Create `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-meeting-notes?retryWrites=true&w=majority

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env)

Create `frontend/.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=AI Meeting Notes Summarizer
VITE_APP_VERSION=1.0.0
```

### 3. Get Required API Keys

#### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

#### Gmail App Password (for Email Service)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Use your Gmail address as `EMAIL_USER` and the app password as `EMAIL_PASS`

**Note**: Regular Gmail passwords won't work. You must use an app password.

#### MongoDB Atlas

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get the connection string
5. Replace the connection string in your `.env` file

### 4. Run the Application

#### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

### 2. Test Email Service (Development Only)

```bash
curl -X POST http://localhost:5000/api/share/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 3. Upload a Test Transcript

1. Open http://localhost:5173
2. Upload a text file or paste some text
3. Generate a summary with a custom prompt
4. Edit and share the summary

## Troubleshooting

### Common Issues

#### "MongoDB connection failed"

- Check your MongoDB URI
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

#### "AI service configuration error"

- Verify your Gemini API key is correct
- Check if you have quota remaining
- Ensure the API key has proper permissions

#### "Email service not configured"

- Verify your SendGrid API key
- Check if your sender email is verified
- Ensure the API key has Mail Send permissions

#### "CORS errors"

- Check that FRONTEND_URL in backend .env matches your frontend URL
- Ensure both servers are running

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Logs**: Check the terminal output for detailed error messages
3. **Network Tab**: Use browser dev tools to inspect API calls
4. **Database**: Use MongoDB Compass to view your data

## Production Deployment

### Backend (Render/Railway/Heroku)

1. Connect your repository
2. Set environment variables
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables

### Environment Variables for Production

- Update `FRONTEND_URL` to your production frontend URL
- Update `VITE_API_URL` to your production backend URL
- Use strong `JWT_SECRET` in production
- Set `NODE_ENV=production`

## API Documentation

### Endpoints

#### Transcripts

- `POST /api/transcripts` - Upload transcript
- `GET /api/transcripts/:id` - Get transcript
- `GET /api/transcripts` - List transcripts
- `DELETE /api/transcripts/:id` - Delete transcript

#### Summaries

- `POST /api/generate` - Generate summary
- `GET /api/summaries/:id` - Get summary
- `PUT /api/summaries/:id` - Update summary
- `GET /api/summaries` - List summaries
- `DELETE /api/summaries/:id` - Delete summary

#### Sharing

- `POST /api/share` - Share summary via email
- `GET /api/share/status` - Get email service status
- `GET /api/share/history/:summaryId` - Get sharing history

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in both frontend and backend terminals
3. Ensure all environment variables are set correctly
4. Verify all external services (MongoDB, Gemini, SendGrid) are configured properly
