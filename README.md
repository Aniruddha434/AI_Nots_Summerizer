# AI Meeting Notes Summarizer

A full-stack application that uses AI to summarize meeting transcripts and share them via email. This project was developed as part of my internship assignment at **MongoDesk**, showcasing modern web development practices and AI integration.

**Developer**: Aniruddha Gayki
**Email**: aniruddhagayki0@gmail.com
**GitHub**: [Aniruddha434](https://github.com/Aniruddha434)
**Live Demo**: [https://ai-nots-summerizer-final3.vercel.app](https://ai-nots-summerizer-final3.vercel.app)

## Features

- 📝 Upload meeting transcripts (file or text)
- 🤖 AI-powered summarization using Google's Gemini API
- ✏️ Edit and refine generated summaries
- 📧 Share summaries via email
- 💾 Save and manage summaries
- 🔐 User authentication and data isolation
- 📱 Responsive design for all devices

## How I Built This Project - Step by Step

This section documents my journey building this AI-powered application from scratch as part of my MongoDesk internship assignment.

### 🎯 Phase 1: Planning and Architecture (Day 1-2)

**The Challenge**: Create a full-stack application that can intelligently summarize meeting notes using AI.

**My Approach**: I started by sketching out the user flow and deciding on the architecture. I wanted to build something scalable and modern, so I chose:

- **Frontend**: React with Vite for fast development and modern tooling
- **Backend**: Node.js with Express for the API
- **Database**: MongoDB for flexible document storage
- **AI**: Google's Gemini API for intelligent summarization

I spent time researching the best practices for each technology and planning how they would work together.

### 🏗️ Phase 2: Backend Foundation (Day 3-5)

**Setting up the Server**: I began with the backend because I wanted to establish the data flow first. I created:

1. **Basic Express Server**: Set up routing, middleware, and error handling
2. **Database Models**: Designed schemas for Users, Transcripts, and Summaries using Mongoose
3. **Authentication System**: Implemented JWT-based auth with proper password hashing
4. **File Upload**: Added multer middleware for handling transcript file uploads

**Key Learning**: I initially used disk storage for file uploads, but later learned this doesn't work well with cloud deployments. I had to refactor to use memory storage.

### 🤖 Phase 3: AI Integration (Day 6-7)

**Connecting to Gemini AI**: This was the most exciting part! I integrated Google's Gemini API to generate intelligent summaries.

**Challenges I Faced**:

- Understanding the API documentation and request format
- Handling rate limits and error responses
- Crafting effective prompts to get quality summaries
- Managing API costs during development

**Solution**: I created a dedicated AI service module that handles all Gemini interactions, with proper error handling and retry logic.

### 🎨 Phase 4: Frontend Development (Day 8-12)

**Building the User Interface**: I focused on creating an intuitive, modern interface:

1. **Component Architecture**: Built reusable components for upload, summary display, and editing
2. **State Management**: Used React Context for global state (auth, transcripts, summaries)
3. **Styling**: Implemented Tailwind CSS for rapid, responsive design
4. **User Experience**: Added loading states, error handling, and success feedback

**Design Philosophy**: I wanted the app to feel professional yet approachable, so I used a clean design with subtle animations and clear visual hierarchy.

### 🔐 Phase 5: Authentication & Security (Day 13-14)

**User Management**: Implemented a complete authentication system:

- User registration and login
- JWT token management
- Protected routes and API endpoints
- Data isolation (users only see their own data)

**Security Measures**: Added rate limiting, input validation, and CORS configuration.

### 📧 Phase 6: Email Integration (Day 15-16)

**Sharing Feature**: Built email functionality so users can share summaries:

- Integrated Nodemailer for email sending
- Created email templates with proper formatting
- Added sharing history and status tracking

**Personal Touch**: I chose to use standard SMTP instead of SendGrid to keep costs low and maintain flexibility.

### 🚀 Phase 7: Deployment Challenges (Day 17-20)

**Going Live**: This was where I learned the most about production deployments:

**Frontend Deployment (Vercel)**:

- Connected GitHub repository
- Configured environment variables
- Set up automatic deployments

**Backend Deployment (Render)**:

- Initially struggled with file upload issues (disk storage problem)
- Learned about ephemeral filesystems in cloud environments
- Refactored to use memory storage for better cloud compatibility

**Database (MongoDB Atlas)**:

- Set up cloud database cluster
- Configured network access and security

**Major Challenges Solved**:

1. **CORS Issues**: Spent hours debugging why frontend couldn't talk to backend. Solution: Properly configured environment variables with full URLs including protocols.
2. **File Upload Failures**: Files weren't being saved on Render. Solution: Switched from disk storage to memory storage.
3. **Environment Variables**: Learning the difference between build-time and runtime variables in different platforms.

### 🔧 Phase 8: Testing and Refinement (Day 21-22)

**Quality Assurance**: I built comprehensive tests and refined the user experience:

- Created test scripts for all API endpoints
- Tested user authentication flows
- Verified AI summarization quality
- Ensured responsive design across devices

**Performance Optimization**: Added loading states, optimized API calls, and improved error handling.

### 📚 What I Learned

**Technical Skills**:

- Full-stack development with modern JavaScript
- AI API integration and prompt engineering
- Cloud deployment and DevOps practices
- Database design and user authentication

**Problem-Solving**:

- How to debug production deployment issues
- The importance of environment-specific configurations
- Cloud platform differences and limitations

**Professional Development**:

- Project planning and time management
- Documentation and code organization
- User experience design principles

This project pushed me to learn new technologies and solve real-world problems. Every challenge taught me something valuable about modern web development.

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
- Nodemailer for email delivery (SMTP)
- JWT authentication
- Multer for file uploads (memory storage)
- Rate limiting and security middleware

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

## Production Deployment

This project is deployed using modern cloud platforms for optimal performance and scalability.

### Live Application

- **Frontend**: [https://ai-nots-summerizer-final3.vercel.app](https://ai-nots-summerizer-final3.vercel.app)
- **Backend API**: [https://ai-nots-summerizer.onrender.com](https://ai-nots-summerizer.onrender.com)
- **Database**: MongoDB Atlas (Cloud)

### Deployment Architecture

**Frontend (Vercel)**:

- Automatic deployments from GitHub main branch
- Environment variables configured in Vercel dashboard
- CDN distribution for global performance
- Root directory: `frontend/`

**Backend (Render)**:

- Automatic deployments from GitHub main branch
- Environment variables configured in Render dashboard
- Health check endpoint: `/health`
- Root directory: `backend/`

**Database (MongoDB Atlas)**:

- Cloud-hosted MongoDB cluster
- Automatic backups and monitoring
- Network security with IP whitelisting

### Key Deployment Learnings

1. **CORS Configuration**: Ensure `FRONTEND_URL` includes full protocol (https://)
2. **File Storage**: Use memory storage instead of disk storage for cloud compatibility
3. **Environment Variables**: Different platforms handle build-time vs runtime variables differently
4. **API Endpoints**: Always include `/api` prefix in base URL configuration

### Deployment Commands

For manual deployment or updates:

```bash
# Push to GitHub (triggers auto-deployment)
git add .
git commit -m "Your commit message"
git push origin main
```

Both Vercel and Render will automatically detect changes and redeploy within 2-3 minutes.

## Project Structure

```
AI_Nots_Summerizer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components (Home, About, etc.)
│   │   ├── context/        # React Context for state management
│   │   ├── services/       # API service functions
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vercel.json         # Vercel deployment config
├── backend/                 # Node.js backend API
│   ├── routes/             # API route handlers
│   ├── models/             # MongoDB schemas
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic (AI, email)
│   ├── config/             # Database configuration
│   ├── utils/              # Utility functions
│   ├── server.js           # Server entry point
│   ├── package.json        # Backend dependencies
│   └── render.yaml         # Render deployment config
├── README.md               # This file
└── .gitignore             # Git ignore rules
```

## Contributing

This project was developed as part of my MongoDesk internship assignment. While it's primarily for educational purposes, suggestions and feedback are welcome!

## Contact

**Aniruddha Gayki**

- Email: aniruddhagayki0@gmail.com
- GitHub: [Aniruddha434](https://github.com/Aniruddha434)
- Project Repository: [AI_Nots_Summerizer](https://github.com/Aniruddha434/AI_Nots_Summerizer)

## Acknowledgments

- **MongoDesk** for providing this internship opportunity
- **Google** for the Gemini AI API
- **Vercel** and **Render** for excellent deployment platforms
- **MongoDB Atlas** for reliable cloud database hosting

## License

MIT License
