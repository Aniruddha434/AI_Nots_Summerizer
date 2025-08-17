import { useState, useEffect, useCallback } from 'react'
import { Save, X, RotateCcw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/AppContext'

function Editor({ initialContent, onSave, onCancel }) {
  const { loading } = useApp()
  const [content, setContent] = useState(initialContent || '')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(initialContent || '')
    setHasChanges(false)
  }, [initialContent])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }
  }, [content, hasChanges])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasChanges(newContent !== initialContent)
  }

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Summary content cannot be empty')
      return
    }

    if (content.trim().length < 10) {
      toast.error('Summary must be at least 10 characters long')
      return
    }

    if (content.length > 100000) {
      toast.error('Summary cannot exceed 100,000 characters')
      return
    }

    if (!hasChanges) {
      toast.info('No changes to save')
      return
    }

    try {
      await onSave(content.trim())
      setHasChanges(false)
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const handleReset = () => {
    if (hasChanges && !confirm('Are you sure you want to discard your changes?')) {
      return
    }
    setContent(initialContent || '')
    setHasChanges(false)
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('Are you sure you want to discard your changes?')) {
      return
    }
    onCancel()
  }

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = content.length

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {wordCount} words • {charCount} characters
          </div>
          {hasChanges && (
            <div className="flex items-center text-sm text-orange-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || loading}
            className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="btn-secondary btn-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || loading || content.trim().length < 10}
            className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-1"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Edit your summary here..."
          className="textarea w-full h-96 resize-none font-mono text-sm leading-relaxed"
          maxLength={100000}
          disabled={loading}
        />
        
        {/* Character count indicator */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
          {charCount}/100,000
        </div>
      </div>

      {/* Validation Messages */}
      {content.trim().length > 0 && content.trim().length < 10 && (
        <div className="flex items-center text-sm text-orange-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          Summary must be at least 10 characters long
        </div>
      )}

      {charCount > 95000 && (
        <div className="flex items-center text-sm text-orange-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          Approaching character limit ({charCount}/100,000)
        </div>
      )}

      {/* Editor Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Editing Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use clear headings and bullet points for better readability</li>
          <li>• Highlight key decisions and action items</li>
          <li>• Include specific names, dates, and deadlines when relevant</li>
          <li>• Keep the summary concise but comprehensive</li>
          <li>• Use keyboard shortcuts: Ctrl+S to save, Ctrl+Z to undo</li>
        </ul>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="text-xs text-gray-500 text-center">
        <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+S</kbd> to save • 
        <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">Ctrl+Z</kbd> to undo • 
        <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">Esc</kbd> to cancel
      </div>
    </div>
  )
}

export default Editor
