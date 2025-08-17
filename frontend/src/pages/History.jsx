import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, FileText, Share2, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { summaryAPI, handleApiError } from '../services/api'
import SummaryRenderer from '../components/SummaryRenderer'
import { useApp } from '../context/AppContext'

function History() {
  const { summaries, setSummaries, setLoading } = useApp()
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchSummaries()
  }, [page])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      const response = await summaryAPI.getAll({ page, limit: 10 })
      setSummaries(response.data)
      setPagination(response.pagination)
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (summaryId) => {
    if (!confirm('Are you sure you want to delete this summary?')) {
      return
    }

    try {
      await summaryAPI.delete(summaryId)
      setSummaries(summaries.filter(s => s._id !== summaryId))
      toast.success('Summary deleted successfully')
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Summary History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your previous meeting summaries
          </p>
        </div>
        <Link to="/" className="btn-primary">
          Create New Summary
        </Link>
      </div>

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first meeting summary.
          </p>
          <div className="mt-6">
            <Link to="/" className="btn-primary">
              Create Summary
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div key={summary._id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {summary.transcript?.originalFilename || 'Text Input'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {summary.status === 'edited' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Edited
                          </span>
                        )}
                        {summary.sharing?.isShared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {summary.prompt}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(summary.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {summary.metadata?.wordCount || 0} words
                      </div>
                      {summary.sharing?.shareCount > 0 && (
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          Shared {summary.sharing.shareCount} time{summary.sharing.shareCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <div className="line-clamp-3 text-sm">
                        <SummaryRenderer
                          content={summary.currentContent.substring(0, 300) + (summary.currentContent.length > 300 ? '...' : '')}
                          metadata={summary.metadata}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Link
                      to={`/summary/${summary._id}`}
                      className="btn-outline btn-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(summary._id)}
                      className="btn-outline btn-sm text-red-600 hover:text-red-700 hover:border-red-300 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span> ({pagination.total} total summaries)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
