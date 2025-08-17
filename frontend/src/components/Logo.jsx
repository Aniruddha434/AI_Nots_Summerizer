import React from 'react'

function Logo({ className = "h-8 w-8", showText = true, textClassName = "text-xl font-bold text-gray-900" }) {
  return (
    <div className="flex items-center space-x-3">
      {/* Custom Logo SVG */}
      <div className="relative logo-glow">
        <svg
          className={`${className} transition-transform duration-300 hover:scale-110`}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle with Gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Main Circle */}
          <circle 
            cx="20" 
            cy="20" 
            r="18" 
            fill="url(#logoGradient)" 
            stroke="#ffffff" 
            strokeWidth="2"
          />
          
          {/* Brain/AI Symbol */}
          <g transform="translate(8, 8)">
            {/* Left Brain Hemisphere */}
            <path 
              d="M4 6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6V18C12 20.2091 10.2091 22 8 22C5.79086 22 4 20.2091 4 18V6Z" 
              fill="url(#innerGradient)" 
              stroke="#1e40af" 
              strokeWidth="1"
            />
            
            {/* Right Brain Hemisphere */}
            <path 
              d="M12 6C12 3.79086 13.7909 2 16 2C18.2091 2 20 3.79086 20 6V18C20 20.2091 18.2091 22 16 22C13.7909 22 12 20.2091 12 18V6Z" 
              fill="url(#innerGradient)" 
              stroke="#1e40af" 
              strokeWidth="1"
            />
            
            {/* Neural Connections */}
            <circle cx="8" cy="8" r="1.5" fill="#1e40af" />
            <circle cx="16" cy="8" r="1.5" fill="#1e40af" />
            <circle cx="8" cy="12" r="1.5" fill="#1e40af" />
            <circle cx="16" cy="12" r="1.5" fill="#1e40af" />
            <circle cx="8" cy="16" r="1.5" fill="#1e40af" />
            <circle cx="16" cy="16" r="1.5" fill="#1e40af" />
            
            {/* Connection Lines */}
            <line x1="8" y1="8" x2="16" y2="8" stroke="#1e40af" strokeWidth="1" opacity="0.6" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="#1e40af" strokeWidth="1" opacity="0.6" />
            <line x1="8" y1="16" x2="16" y2="16" stroke="#1e40af" strokeWidth="1" opacity="0.6" />
            
            {/* Vertical Connections */}
            <line x1="8" y1="8" x2="8" y2="12" stroke="#1e40af" strokeWidth="1" opacity="0.4" />
            <line x1="8" y1="12" x2="8" y2="16" stroke="#1e40af" strokeWidth="1" opacity="0.4" />
            <line x1="16" y1="8" x2="16" y2="12" stroke="#1e40af" strokeWidth="1" opacity="0.4" />
            <line x1="16" y1="12" x2="16" y2="16" stroke="#1e40af" strokeWidth="1" opacity="0.4" />
          </g>
          
          {/* Sparkle Effects */}
          <g opacity="0.8">
            <circle cx="32" cy="8" r="1" fill="#fbbf24" />
            <circle cx="35" cy="12" r="0.8" fill="#f59e0b" />
            <circle cx="6" cy="32" r="1" fill="#fbbf24" />
            <circle cx="34" cy="30" r="0.8" fill="#f59e0b" />
          </g>
        </svg>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10"></div>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={textClassName}>
            AI Meeting Notes
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            Powered by Gemini
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
