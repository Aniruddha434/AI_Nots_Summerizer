import { useState } from 'react'
import { Sparkles, FileText, Clock, AlertCircle, Lightbulb } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { summaryAPI, handleApiError } from '../services/api'
import { useApp } from '../context/AppContext'
import GenerateButton from './GenerateButton'

function PromptBox({ transcript, onSummaryGenerated }) {
  const { addSummary, setLoading, loading } = useApp()
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const promptTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for leadership with strategic insights',
      prompt: `Create a **strategic executive summary** for senior leadership. Focus on: **key strategic decisions** with business impact, **financial implications** and budget items, **critical risks** requiring executive attention, **high-priority action items** with clear ownership and deadlines. Use professional formatting with headers and emphasis. Keep under 250 words.`
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Meeting Summary',
      description: 'Detailed summary with all key elements and professional analysis',
      prompt: `Create a **comprehensive meeting summary** with clear structure. Include: **## Key Decisions** with rationale and impact, **## Action Items** organized by priority with owners and deadlines, **## Discussion Outcomes** and important points raised, **## Financial/Budget Items** if applicable, **## Risks and Blockers** requiring attention, **## Next Steps** and follow-up requirements. Use professional formatting and emphasis. Keep under 300 words.`
    },
    {
      id: 'action-items',
      name: 'Action Items Focus',
      description: 'Comprehensive task tracking with owners, deadlines, and priorities',
      prompt: `Extract and organize **all action items** with enhanced formatting. Structure as: **## Immediate Actions** (this week), **## Short-term Actions** (next 2-4 weeks), **## Long-term Actions** (beyond 1 month). For each item include: **Owner**: clear task description *(deadline)*. Also include **## Pending Decisions**, **## Dependencies**, and **## Blockers**. Provide action item count summary. Keep under 250 words.`
    },
    {
      id: 'sales',
      name: 'Sales Meeting Summary',
      description: 'Deal tracking, client insights, and sales progression analysis',
      prompt: `Create a **sales meeting analysis** with structured formatting. Include: **## Deal Status** (value, timeline, stage), **## Client Insights** (pain points, solutions presented), **## Objections & Responses**, **## Decision Makers** and their sentiment, **## Budget Discussion**, **## Next Steps** with clear owners and deadlines, **## Deal Health Assessment**. Use emphasis for important numbers and dates. Keep under 250 words.`
    },
    {
      id: 'project',
      name: 'Project Meeting Summary',
      description: 'Project status, milestones, blockers, and resource management',
      prompt: `Create a **project status summary** with clear structure. Include: **## Project Status** (phase, progress, timeline, budget), **## Recent Accomplishments**, **## Current Challenges** and blockers with proposed solutions, **## Resource Updates**, **## Risk Management**, **## Action Items** by category with owners and deadlines, **## Timeline Updates**, **## Overall Project Health**. Use formatting to highlight critical information. Keep under 250 words.`
    },
    {
      id: 'custom',
      name: 'Custom Prompt',
      description: 'Write your own instructions with enhanced AI processing',
      prompt: ''
    }
  ]

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id)
    setPrompt(template.prompt)
  }

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value
    setPrompt(newPrompt)
    
    // If user starts typing, switch to custom
    if (newPrompt && selectedTemplate !== 'custom') {
      const currentTemplate = promptTemplates.find(t => t.id === selectedTemplate)
      if (currentTemplate && newPrompt !== currentTemplate.prompt) {
        setSelectedTemplate('custom')
      }
    }
  }

  const validatePrompt = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt or select a template')
      return false
    }

    if (prompt.trim().length < 5) {
      toast.error('Prompt must be at least 5 characters long')
      return false
    }

    if (prompt.length > 1000) {
      toast.error('Prompt cannot exceed 1,000 characters')
      return false
    }

    return true
  }

  const handleGenerate = async (e) => {
    e.preventDefault()

    if (!validatePrompt()) {
      return
    }

    try {
      setLoading(true)

      const response = await summaryAPI.generate({
        transcriptId: transcript.id,
        prompt: prompt.trim()
      });

      addSummary(response.data)
      toast.success('Summary generated successfully!')

      if (onSummaryGenerated) {
        onSummaryGenerated(response.data)
      }

    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const charCount = prompt.length
  const wordCount = prompt.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="space-y-6">
      {/* Transcript Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transcript Ready</h2>
          <p className="card-description">
            Your transcript has been uploaded successfully. Now choose how you'd like it summarized.
          </p>
        </div>
        <div className="card-content">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {transcript.originalFilename || 'Text Input'}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {transcript.metadata?.wordCount || 0} words
            </div>
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              ~{transcript.metadata?.estimatedDuration || 0} min read
            </div>
          </div>
          
          {transcript.preview && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Preview:</span> {transcript.preview}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">AI Summary Templates</h2>
          <p className="card-description">
            Professional templates with advanced AI processing and comprehensive analysis
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {promptTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  </div>
                  {template.id === 'custom' && (
                    <Lightbulb className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Prompt Input */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {selectedTemplate === 'custom' ? 'Custom Prompt' : 'Review & Customize'}
          </h2>
          <p className="card-description">
            {selectedTemplate === 'custom' 
              ? 'Write detailed instructions for how you want your meeting summarized'
              : 'You can modify the template or add specific instructions'
            }
          </p>
        </div>
        <div className="card-content">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Enter your summarization instructions here..."
                className="textarea w-full h-32 resize-none"
                maxLength={1000}
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>{wordCount} words, {charCount} characters</span>
                <span className={charCount > 900 ? 'text-orange-600' : ''}>
                  {charCount}/1,000
                </span>
              </div>
            </div>

            {charCount > 0 && charCount < 5 && (
              <div className="flex items-center text-sm text-orange-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Minimum 5 characters required
              </div>
            )}

            <div className="flex justify-center pt-6">
              <GenerateButton
                type="submit"
                loading={loading}
                disabled={!prompt.trim() || prompt.trim().length < 5}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced AI Features */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-purple-900">
              Enhanced AI Features
            </h3>
            <ul className="mt-2 text-sm text-purple-700 space-y-1">
              <li>✓ Beautiful, organized formatting without asterisks</li>
              <li>✓ Advanced action item extraction with owners and deadlines</li>
              <li>✓ Professional structure with numbered lists and sections</li>
              <li>✓ Quality scoring and comprehensive analysis</li>
              <li>✓ Decision tracking and follow-up identification</li>
              <li>✓ Risk assessment and opportunity highlighting</li>
              <li>✓ Specialized templates for different meeting types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptBox
