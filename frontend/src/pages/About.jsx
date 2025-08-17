import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Github, Mail, ExternalLink, Code, Database, Cloud, Zap } from 'lucide-react'

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">About This Project</h1>
          <p className="text-xl text-gray-600">AI-Powered Meeting Notes Summarizer</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This AI-powered meeting notes summarizer was developed as part of my internship assignment at 
                <span className="font-semibold text-blue-600"> MongoDesk</span>. The project demonstrates 
                modern full-stack development practices, combining cutting-edge AI technology with robust 
                web development frameworks.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The application allows users to upload meeting transcripts or paste text directly, then 
                generates intelligent summaries using Google's Gemini AI. It features user authentication, 
                data persistence, and sharing capabilities - all built with scalability and user experience in mind.
              </p>
            </div>

            {/* Development Journey */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Development Journey</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Planning & Architecture</h3>
                  <p className="text-gray-700">
                    Started by designing a scalable architecture with separate frontend and backend services. 
                    Chose React with Vite for the frontend and Node.js with Express for the backend, ensuring 
                    modern development practices and optimal performance.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Backend Development</h3>
                  <p className="text-gray-700">
                    Built a robust REST API with MongoDB for data persistence, JWT authentication for security, 
                    and integrated Google's Gemini AI for intelligent text summarization. Implemented proper 
                    error handling, rate limiting, and data validation.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Frontend Development</h3>
                  <p className="text-gray-700">
                    Created an intuitive user interface with React, featuring drag-and-drop file uploads, 
                    real-time feedback, and responsive design. Used Tailwind CSS for styling and implemented 
                    proper state management with React Context.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Deployment & Production</h3>
                  <p className="text-gray-700">
                    Deployed the application to production using modern cloud platforms - Vercel for the 
                    frontend and Render for the backend. Configured environment variables, CORS policies, 
                    and optimized for production performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Stack */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Stack</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-blue-500" />
                    Frontend
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• React 18 with Vite</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• React Router for navigation</li>
                    <li>• Axios for API communication</li>
                    <li>• React Hot Toast for notifications</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-green-500" />
                    Backend
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Node.js with Express</li>
                    <li>• MongoDB with Mongoose</li>
                    <li>• JWT Authentication</li>
                    <li>• Google Gemini AI Integration</li>
                    <li>• Multer for file uploads</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-purple-500" />
                    Deployment
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Vercel (Frontend)</li>
                    <li>• Render (Backend)</li>
                    <li>• MongoDB Atlas (Database)</li>
                    <li>• GitHub for version control</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-orange-500" />
                    Features
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• AI-powered summarization</li>
                    <li>• User authentication</li>
                    <li>• File upload support</li>
                    <li>• Email sharing</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Challenges & Solutions */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenges & Solutions</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">CORS Configuration</h3>
                  <p className="text-gray-700">
                    Encountered CORS issues when deploying to production. Solved by properly configuring 
                    environment variables and ensuring the frontend URL included the correct protocol.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">File Upload in Production</h3>
                  <p className="text-gray-700">
                    Initial disk storage approach failed on Render's ephemeral filesystem. Switched to 
                    memory storage for better cloud compatibility and performance.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">User Data Isolation</h3>
                  <p className="text-gray-700">
                    Implemented proper user authentication and data isolation to ensure users can only 
                    access their own transcripts and summaries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Developer Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">AG</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aniruddha Gayki</h3>
                <p className="text-gray-600">Full Stack Developer</p>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="mailto:aniruddhagayki0@gmail.com"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  aniruddhagayki0@gmail.com
                </a>
                
                <a 
                  href="https://github.com/Aniruddha434"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Github className="w-4 h-4 mr-3" />
                  Aniruddha434
                </a>
              </div>
            </div>

            {/* Project Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Project Links</h3>
              <div className="space-y-3">
                <a 
                  href="https://github.com/Aniruddha434/AI_Nots_Summerizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Github className="w-4 h-4 mr-3" />
                  Source Code
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                
                <a 
                  href="https://ai-nots-summerizer.onrender.com/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Database className="w-4 h-4 mr-3" />
                  Backend API
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </div>

            {/* Internship Info */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">MongoDesk Internship</h3>
              <p className="text-blue-100 text-sm">
                This project was developed as part of my internship assignment at MongoDesk, 
                demonstrating full-stack development skills and modern web technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
