import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import FileUploader from '../../components/common/FileUploader'
import PhotoCapture from '../../components/common/PhotoCapture'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiFileText, FiCamera, FiUpload } = FiIcons

const UploadDocumentScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useData()
  
  // Get project ID from query params if available
  const queryParams = new URLSearchParams(location.search)
  const projectIdParam = queryParams.get('projectId')

  const [selectedProject, setSelectedProject] = useState(projectIdParam || '')
  const [category, setCategory] = useState('general')
  const [uploadType, setUploadType] = useState('files') // 'files' or 'photos'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    { value: 'general', label: 'General Documents' },
    { value: 'drawings', label: 'Drawings & Plans' },
    { value: 'permits', label: 'Permits & Licenses' },
    { value: 'contracts', label: 'Contracts & Agreements' },
    { value: 'photos', label: 'Project Photos' },
    { value: 'invoices', label: 'Invoices & Receipts' },
    { value: 'reports', label: 'Reports & Inspections' }
  ]

  const handleUploadComplete = (uploadedFiles) => {
    setError('')
    setSuccess(`Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`)
    
    // Navigate back to documents after a short delay
    setTimeout(() => {
      if (selectedProject) {
        navigate(`/app/projects/${selectedProject}`)
      } else {
        navigate('/app/documents')
      }
    }, 2000)
  }

  const handleUploadError = (errorMessage) => {
    setError(errorMessage)
    setSuccess('')
  }

  const handlePhotoCapture = (capturedPhotos) => {
    setError('')
    setSuccess(`Successfully captured and uploaded ${capturedPhotos.length} photo${capturedPhotos.length !== 1 ? 's' : ''}`)
    
    // Navigate back after a short delay
    setTimeout(() => {
      if (selectedProject) {
        navigate(`/app/projects/${selectedProject}`)
      } else {
        navigate('/app/documents')
      }
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to={selectedProject ? `/app/projects/${selectedProject}` : '/app/documents'}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Upload Documents
          </h1>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Upload Configuration */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Upload Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Selection */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project *
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a project</option>
              {data.projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Type Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Upload Method
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadType('files')}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                uploadType === 'files'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2" />
              File Upload
            </button>
            
            <button
              onClick={() => setUploadType('photos')}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                uploadType === 'photos'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <SafeIcon icon={FiCamera} className="w-5 h-5 mr-2" />
              Photo Capture
            </button>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      {selectedProject && (
        <div className="card">
          {uploadType === 'files' ? (
            <FileUploader
              projectId={selectedProject}
              category={category}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              multiple={true}
              maxSizeInMB={25}
              acceptedTypes={[
                'image/*',
                '.pdf',
                '.doc',
                '.docx',
                '.xls',
                '.xlsx',
                '.ppt',
                '.pptx',
                '.txt',
                '.csv'
              ]}
            />
          ) : (
            <PhotoCapture
              projectId={selectedProject}
              category={category}
              onPhotoCapture={handlePhotoCapture}
              onError={handleUploadError}
              maxPhotos={20}
            />
          )}
        </div>
      )}

      {/* Help Information */}
      <div className="card bg-gray-50 dark:bg-gray-800">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
          Upload Guidelines
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start">
            <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium">File Types:</p>
              <p>Images (JPG, PNG, GIF), Documents (PDF, DOC, XLS), and more</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <SafeIcon icon={FiFileText} className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">File Size:</p>
              <p>Maximum 25MB per file. Multiple files can be uploaded at once.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <SafeIcon icon={FiCamera} className="w-4 h-4 mr-2 mt-0.5 text-purple-500" />
            <div>
              <p className="font-medium">Photo Capture:</p>
              <p>Take photos directly with your device camera. Location and timestamp are automatically recorded.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadDocumentScreen