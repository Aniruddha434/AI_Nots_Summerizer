import { useState, useRef } from 'react'
import { Upload as UploadIcon, FileText, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { transcriptAPI, handleApiError } from '../services/api'
import { useApp } from '../context/AppContext'

function Upload({ onTranscriptUploaded }) {
  const { addTranscript, setLoading, loading } = useApp()
  const [dragActive, setDragActive] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'text'
  const [textContent, setTextContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/json', 'text/markdown']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a text file (.txt, .csv, .json, .md)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setUploadMethod('file')
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleTextChange = (e) => {
    const text = e.target.value
    setTextContent(text)
    
    // Clear file selection when typing
    if (text && selectedFile) {
      setSelectedFile(null)
    }
  }

  const validateInput = () => {
    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select a file to upload')
      return false
    }

    if (uploadMethod === 'text' && !textContent.trim()) {
      toast.error('Please enter some text content')
      return false
    }

    const content = uploadMethod === 'text' ? textContent.trim() : null
    if (content && content.length < 10) {
      toast.error('Text content must be at least 10 characters long')
      return false
    }

    if (content && content.length > 50000) {
      toast.error('Text content cannot exceed 50,000 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateInput()) {
      return
    }

    try {
      setLoading(true)

      const uploadData = {}
      
      if (uploadMethod === 'file' && selectedFile) {
        uploadData.file = selectedFile
      } else if (uploadMethod === 'text' && textContent.trim()) {
        uploadData.text = textContent.trim()
      }

      const response = await transcriptAPI.upload(uploadData)
      
      addTranscript(response.data)
      toast.success('Transcript uploaded successfully!')
      
      // Reset form
      setSelectedFile(null)
      setTextContent('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (onTranscriptUploaded) {
        onTranscriptUploaded()
      }

    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = textContent.length

  return (
    <div className="space-y-6">
      {/* Upload Method Selector */}
      <div className="flex justify-center">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              uploadMethod === 'file'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('text')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              uploadMethod === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {uploadMethod === 'file' ? (
          /* File Upload */
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                {selectedFile ? (
                  <div className="space-y-3">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop your transcript file here
                      </p>
                      <p className="text-sm text-gray-500">
                        or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          browse files
                        </button>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supports .txt, .csv, .json, .md files up to 10MB
                    </p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.csv,.json,.md,text/plain,text/csv,application/json,text/markdown"
                onChange={handleFileInputChange}
              />
            </div>
          </div>
        ) : (
          /* Text Input */
          <div className="space-y-4">
            <div>
              <label htmlFor="transcript-text" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your meeting transcript
              </label>
              <textarea
                id="transcript-text"
                value={textContent}
                onChange={handleTextChange}
                placeholder="Paste your meeting transcript here..."
                className="textarea w-full h-64 resize-none"
                maxLength={50000}
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>
                  {wordCount} words, {charCount} characters
                </span>
                <span className={charCount > 45000 ? 'text-orange-600' : ''}>
                  {charCount}/50,000
                </span>
              </div>
            </div>
            
            {charCount > 0 && charCount < 10 && (
              <div className="flex items-center text-sm text-orange-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Minimum 10 characters required
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'text' && textContent.trim().length < 10)}
            className="btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-5 w-5 mr-2" />
                Upload Transcript
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
