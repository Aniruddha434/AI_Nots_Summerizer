import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Upload from '../components/Upload'
import PromptBox from '../components/PromptBox'
import { useApp } from '../context/AppContext'

function Home() {
  const navigate = useNavigate()
  const { currentTranscript, currentSummary } = useApp()
  const [step, setStep] = useState(1) // 1: Upload, 2: Prompt, 3: Summary

  const handleTranscriptUploaded = () => {
    setStep(2)
  }

  const handleSummaryGenerated = (summary) => {
    navigate(`/summary/${summary._id}`)
  }

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          AI Meeting Notes Summarizer
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Upload your meeting transcripts and get AI-powered summaries with custom prompts.
          Edit, save, and share your summaries via email.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <nav aria-label="Progress">
          <ol className="flex items-center space-x-5">
            <li className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 1 ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
              }`}>
                <span className={`text-sm font-medium ${
                  step >= 1 ? 'text-white' : 'text-gray-500'
                }`}>
                  1
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Upload</span>
            </li>
            
            <div className="flex-1 flex items-center">
              <div className={`w-full h-0.5 ${
                step >= 2 ? 'bg-primary-600' : 'bg-gray-300'
              }`}></div>
            </div>
            
            <li className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 2 ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
              }`}>
                <span className={`text-sm font-medium ${
                  step >= 2 ? 'text-white' : 'text-gray-500'
                }`}>
                  2
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Generate</span>
            </li>
            
            <div className="flex-1 flex items-center">
              <div className={`w-full h-0.5 ${
                step >= 3 ? 'bg-primary-600' : 'bg-gray-300'
              }`}></div>
            </div>
            
            <li className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 3 ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
              }`}>
                <span className={`text-sm font-medium ${
                  step >= 3 ? 'text-white' : 'text-gray-500'
                }`}>
                  3
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Edit & Share</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <Upload onTranscriptUploaded={handleTranscriptUploaded} />
        )}
        
        {step === 2 && currentTranscript && (
          <PromptBox 
            transcript={currentTranscript}
            onSummaryGenerated={handleSummaryGenerated}
          />
        )}
      </div>

      {/* Features Section */}
      {step === 1 && (
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage your meeting notes efficiently
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Upload</h3>
              <p className="mt-2 text-base text-gray-500">
                Upload text files or paste content directly. Supports multiple formats.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">AI-Powered</h3>
              <p className="mt-2 text-base text-gray-500">
                Advanced AI summarization with custom prompts using Google's Gemini.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Share Easily</h3>
              <p className="mt-2 text-base text-gray-500">
                Share summaries via email with custom messages and formatting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
