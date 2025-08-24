import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { 
  FiArrowLeft, FiDownload, FiTrash2, FiFile, 
  FiFileText, FiImage, FiUser, FiCalendar 
} = FiIcons

const DocumentViewerScreen = () => {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { getDocumentById, deleteDocument, getProjectById } = useData()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const document = documentId ? getDocumentById(documentId) : null
  
  if (!document) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Document not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The document you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/app/documents"
            className="btn-primary"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    )
  }
  
  const project = getProjectById(document.projectId)
  
  const getDocumentIcon = () => {
    if (document.type === 'pdf') return FiFileText
    if (document.type === 'jpg' || document.type === 'png') return FiImage
    return FiFile
  }
  
  const handleDeleteDocument = () => {
    setLoading(true)
    
    try {
      deleteDocument(documentId)
      navigate('/app/documents')
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDownload = () => {
    // In a real app, this would download the actual file
    window.open(document.url, '_blank')
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/documents"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {document.name}
            </h1>
            <Link
              to={`/app/projects/${project.id}`}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              {project.name}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            title="Download"
          >
            <SafeIcon icon={FiDownload} className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title="Delete"
          >
            <SafeIcon icon={FiTrash2} className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Document Details */}
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <SafeIcon 
              icon={getDocumentIcon()} 
              className="w-8 h-8 text-gray-700 dark:text-gray-300" 
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {document.name}
            </h2>
            
            <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">{document.type.toUpperCase()}</span> • {document.size}
              </div>
              
              <div className="flex items-center">
                <SafeIcon icon={FiUser} className="w-4 h-4 mr-1" />
                Uploaded by: {document.uploadedBy}
              </div>
              
              <div className="flex items-center">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                {format(new Date(document.uploadedAt), 'MMMM d, yyyy')}
              </div>
            </div>
            
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {document.category}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Preview */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Preview
        </h3>
        
        {document.type === 'pdf' ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              PDF preview not available in this demo.
            </p>
            <button
              onClick={handleDownload}
              className="btn-primary py-2 px-6"
            >
              Download PDF
            </button>
          </div>
        ) : document.type === 'jpg' || document.type === 'png' ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <SafeIcon icon={FiImage} className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Image preview not available in this demo.
            </p>
            <button
              onClick={handleDownload}
              className="btn-primary py-2 px-6"
            >
              View Image
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <SafeIcon icon={FiFile} className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Preview not available for this file type.
            </p>
            <button
              onClick={handleDownload}
              className="btn-primary py-2 px-6"
            >
              Download File
            </button>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <SafeIcon icon={FiTrash2} className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Delete Document
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this document? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteDocument}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewerScreen