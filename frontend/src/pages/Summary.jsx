import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, Share2, Clock, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { summaryAPI, handleApiError } from '../services/api'
import { useApp } from '../context/AppContext'
import Editor from '../components/Editor'
import ShareModal from '../components/ShareModal'
import SummaryRenderer from '../components/SummaryRenderer'

function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentSummary, setCurrentSummary, updateSummary, setLoading } = useApp()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (id) {
      fetchSummary(id)
    }
  }, [id])

  const fetchSummary = async (summaryId) => {
    try {
      setLoading(true)
      const response = await summaryAPI.getById(summaryId)
      setSummary(response.data)
      setCurrentSummary(response.data)
    } catch (error) {
      toast.error(handleApiError(error))
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (editedContent) => {
    try {
      setLoading(true)
      const response = await summaryAPI.update(id, { editedContent })
      setSummary(response.data)
      updateSummary(response.data)
      setIsEditing(false)
      toast.success('Summary updated successfully!')
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner-lg text-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleShare}
                className="btn-primary flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Summary Info */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="card-title">Meeting Summary</h1>
              <p className="card-description">
                {summary.transcript?.originalFilename || 'Text Input'} • 
                Generated {new Date(summary.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {summary.metadata?.wordCount || 0} words
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Version {summary.currentVersion}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Prompt Used</h2>
        </div>
        <div className="card-content">
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {summary.prompt}
          </p>
        </div>
      </div>

      {/* Summary Content */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Summary' : 'Summary'}
            </h2>
            {summary.status === 'edited' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Edited
              </span>
            )}
          </div>
        </div>
        <div className="card-content">
          {isEditing ? (
            <Editor
              initialContent={summary.currentContent}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <SummaryRenderer
              content={summary.currentContent}
              metadata={summary.metadata}
              className="mt-2"
            />
          )}
        </div>
      </div>

      {/* Transcript Preview */}
      {summary.transcript && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Original Transcript</h2>
            <p className="card-description">
              {summary.transcript.metadata?.wordCount || 0} words • 
              Estimated {summary.transcript.metadata?.estimatedDuration || 0} minutes
            </p>
          </div>
          <div className="card-content">
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {summary.transcript.text?.substring(0, 1000)}
                {summary.transcript.text?.length > 1000 && '...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          summary={summary}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}

export default Summary
