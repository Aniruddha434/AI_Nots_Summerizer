# AI Meeting Notes Summarizer & Sharer

A full-stack application that uses AI to summarize meeting transcripts and share them via email.

## Features

- 📝 Upload meeting transcripts (file or text)
- 🤖 AI-powered summarization using Google's Gemini API
- ✏️ Edit and refine generated summaries
- 📧 Share summaries via email
- 💾 Save and manage summaries

## Tech Stack

### Frontend

- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for form handling

### Backend

- Node.js with Express
- MongoDB with Mongoose
- Google Generative AI (Gemini)
- SendGrid for email delivery
- JWT authentication

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google AI Studio API key
- SendGrid account

### Installation

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd ai-meeting-notes
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

### Environment Variables

#### Backend (.env)

- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google AI Studio API key
- `EMAIL_USER` - Email username (Gmail address)
- `EMAIL_PASS` - Email password (App password for Gmail)
- `FROM_EMAIL` - Sender email address
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

#### Frontend (.env)

- `VITE_API_URL` - Backend API URL

## API Endpoints

- `POST /api/transcripts` - Upload transcript
- `POST /api/generate` - Generate AI summary
- `GET /api/summaries/:id` - Get summary
- `PUT /api/summaries/:id` - Update summary
- `POST /api/share` - Share summary via email

## Deployment

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Render/Railway/Heroku)

1. Connect your repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## License

MIT License
