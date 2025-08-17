import React from 'react'
import { Sparkles, Zap, Brain } from 'lucide-react'

function GenerateButton({ 
  loading = false, 
  disabled = false, 
  onClick, 
  type = "button",
  className = "" 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        group relative overflow-hidden
        bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600
        hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700
        text-white font-semibold
        px-8 py-4 rounded-xl
        shadow-lg hover:shadow-xl
        transform transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-1
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        disabled:opacity-50 disabled:cursor-not-allowed 
        disabled:transform-none disabled:shadow-lg
        min-w-[200px] h-14
        ${className}
      `}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Button Content */}
      <div className="relative flex items-center justify-center space-x-3">
        {loading ? (
          <>
            {/* Loading State */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 w-3 h-3 m-auto text-white/60" />
              </div>
              <span className="text-base font-medium">
                Generating AI Summary...
              </span>
            </div>
            
            {/* Pulsing dots */}
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        ) : (
          <>
            {/* Normal State */}
            <div className="relative">
              <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <span className="text-base font-medium tracking-wide">
              Generate AI Summary
            </span>
            
            <Zap className="w-4 h-4 transition-transform group-hover:translate-x-1 opacity-80" />
          </>
        )}
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  )
}

export default GenerateButton
