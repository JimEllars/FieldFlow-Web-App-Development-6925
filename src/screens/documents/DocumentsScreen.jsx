import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../stores/dataStore'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiFilter, FiFile, FiFileText, FiImage, FiClipboard } = FiIcons

const DocumentsScreen = () => {
  const { data, loading } = useDataStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({
    project: 'all', // all, project-1, project-2, etc.
    category: 'all' // all, drawings, permits, photos, etc.
  })

  const getDocumentIcon = (type) => {
    if (type === 'pdf') return FiFileText
    if (type === 'jpg' || type === 'png') return FiImage
    return FiFile
  }

  const filteredDocuments = data.documents
    .filter(doc => {
      // Apply search filter
      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Apply project filter
      if (filter.project !== 'all' && doc.projectId !== filter.project.replace('project-', '')) {
        return false
      }

      // Apply category filter
      if (filter.category !== 'all' && doc.category !== filter.category) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by upload date (most recent first)
      return new Date(b.uploadedAt) - new Date(a.uploadedAt)
    })

  if (loading) {
    return <LoadingSpinner text="Loading documents..." />
  }

  // Get unique categories
  const categories = [...new Set(data.documents.map(doc => doc.category))]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <Link
            to="/app/documents/upload"
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Project Filter */}
        <div className="flex-grow min-w-[200px]">
          <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project
          </label>
          <select
            id="project-filter"
            value={filter.project}
            onChange={(e) => setFilter({ ...filter, project: e.target.value })}
            className="input-field py-2"
          >
            <option value="all">All Projects</option>
            {data.projects.map(project => (
              <option key={project.id} value={`project-${project.id}`}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-grow min-w-[200px]">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="input-field py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="card text-center py-12">
          <SafeIcon icon={FiClipboard} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter.project !== 'all' || filter.category !== 'all'
              ? 'Try changing your search or filters'
              : 'Upload your first document to get started'
            }
          </p>
          <Link to="/app/documents/upload" className="btn-primary inline-flex items-center">
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            Upload Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <Link
              key={doc.id}
              to={`/app/documents/${doc.id}`}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                  <SafeIcon icon={getDocumentIcon(doc.type)} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-block mr-3">
                      {doc.type.toUpperCase()} • {doc.size}
                    </span>
                    <span>
                      {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mr-2">
                      {doc.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {data.projects.find(p => p.id === doc.projectId)?.name || 'Unknown Project'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentsScreen