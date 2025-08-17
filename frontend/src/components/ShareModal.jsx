import { useState, useEffect } from 'react'
import { X, Mail, Plus, Trash2, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { shareAPI, handleApiError } from '../services/api'
import SummaryRenderer from './SummaryRenderer'
import { useApp } from '../context/AppContext'

function ShareModal({ summary, onClose }) {
  const { updateSummary, setLoading, loading } = useApp()
  const [recipients, setRecipients] = useState([''])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [emailStatus, setEmailStatus] = useState(null)
  const [shareResult, setShareResult] = useState(null)

  useEffect(() => {
    // Set default subject
    const filename = summary.transcript?.originalFilename || 'Meeting'
    const date = new Date().toLocaleDateString()
    setSubject(`Meeting Summary: ${filename} - ${date}`)

    // Check email service status
    checkEmailStatus()
  }, [summary])

  const checkEmailStatus = async () => {
    try {
      const response = await shareAPI.getStatus()
      setEmailStatus(response.data)
    } catch (error) {
      console.error('Failed to check email status:', error)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...recipients]
    newRecipients[index] = value
    setRecipients(newRecipients)
  }

  const addRecipient = () => {
    setRecipients([...recipients, ''])
  }

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index)
      setRecipients(newRecipients)
    }
  }

  const validateForm = () => {
    const validEmails = recipients.filter(email => email.trim() && validateEmail(email.trim()))
    
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address')
      return false
    }

    const invalidEmails = recipients.filter(email => email.trim() && !validateEmail(email.trim()))
    if (invalidEmails.length > 0) {
      toast.error('Please fix invalid email addresses')
      return false
    }

    if (subject.length > 200) {
      toast.error('Subject line cannot exceed 200 characters')
      return false
    }

    if (message.length > 1000) {
      toast.error('Message cannot exceed 1,000 characters')
      return false
    }

    return true
  }

  const handleShare = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const validEmails = recipients.filter(email => email.trim() && validateEmail(email.trim()))

    try {
      setLoading(true)

      const shareData = {
        summaryId: summary._id,
        recipients: validEmails.map(email => email.trim()),
        subject: subject.trim() || undefined,
        message: message.trim() || undefined
      }

      const response = await shareAPI.share(shareData)
      
      // Update summary with sharing info
      updateSummary({
        ...summary,
        sharing: {
          ...summary.sharing,
          isShared: true,
          shareCount: (summary.sharing?.shareCount || 0) + validEmails.length,
          sharedAt: new Date().toISOString()
        }
      })

      setShareResult(response.data)
      toast.success(`Summary shared with ${response.data.accepted.length} recipient(s)!`)

    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (shareResult) {
      onClose()
    } else if (recipients.some(email => email.trim()) || subject.trim() || message.trim()) {
      if (confirm('Are you sure you want to close? Your changes will be lost.')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  if (shareResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Summary Shared Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your summary has been sent to {shareResult.accepted.length} recipient(s).
            </p>
            
            {shareResult.rejected.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-orange-700">
                  {shareResult.rejected.length} email(s) could not be delivered:
                </p>
                <ul className="text-xs text-orange-600 mt-1">
                  {shareResult.rejected.map((email, index) => (
                    <li key={index}>• {email}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Summary</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send this summary via email to your team
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Email Service Status */}
        {emailStatus && !emailStatus.ready && (
          <div className="mx-6 mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Email service not configured
                </p>
                <p className="text-sm text-orange-700">
                  Please contact your administrator to set up email delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleShare} className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <div className="space-y-2">
              {recipients.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleRecipientChange(index, e.target.value)}
                      placeholder="Enter email address"
                      className={`input ${
                        email.trim() && !validateEmail(email.trim())
                          ? 'border-red-300 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                  </div>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRecipient}
              className="mt-2 flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add another recipient
            </button>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject (optional)
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="input"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to include with the summary"
              className="textarea h-24"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/1,000 characters
            </p>
          </div>

          {/* Summary Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Preview
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="text-sm">
                <SummaryRenderer
                  content={summary.currentContent.substring(0, 300) + (summary.currentContent.length > 300 ? '...' : '')}
                  metadata={summary.metadata}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !emailStatus?.ready || recipients.filter(email => email.trim() && validateEmail(email.trim())).length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Summary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShareModal
