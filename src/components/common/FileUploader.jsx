import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { compressImage } from '../../utils/imageCompression'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiUpload, FiX, FiFile, FiImage, FiFileText, FiCheck, FiAlertTriangle, FiCompress } = FiIcons

const FileUploader = ({
  projectId,
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.xlsx', '.xls'],
  maxSizeInMB = 10,
  multiple = false,
  category = 'general'
}) => {
  const { user, testMode } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FiImage
    if (fileType === 'application/pdf') return FiFileText
    return FiFile
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files)
    const processedFiles = []
    const errors = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const error = validateFile(file)
      
      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }

      let processedFile = file
      let compressionInfo = null

      // Auto-compress images
      if (file.type.startsWith('image/')) {
        try {
          setUploadProgress(prev => ({
            ...prev,
            [`temp-${i}`]: { progress: 0, status: 'compressing', fileName: file.name }
          }))

          const compressedFile = await compressImage(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            quality: 0.8
          })

          if (compressedFile.size < file.size) {
            processedFile = compressedFile
            compressionInfo = {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
            }
          }

          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[`temp-${i}`]
            return newProgress
          })

        } catch (compressionError) {
          console.error('Compression failed:', compressionError)
          // Continue with original file
        }
      }

      processedFiles.push({
        file: processedFile,
        originalFile: file,
        compressionInfo,
        id: `file-${Date.now()}-${i}`
      })
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'))
    }

    if (!multiple && processedFiles.length > 1) {
      onUploadError?.('Please select only one file')
      return
    }

    setSelectedFiles(processedFiles)
  }

  const uploadFile = async (fileData, index) => {
    const { file, originalFile, compressionInfo, id } = fileData

    try {
      // Generate unique filename
      const fileExt = originalFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${projectId}/${category}/${fileName}`

      // Create upload progress tracking
      setUploadProgress(prev => ({
        ...prev,
        [index]: { progress: 0, status: 'uploading', fileName: originalFile.name }
      }))

      if (testMode) {
        // Test mode - simulate upload with progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({
            ...prev,
            [index]: { progress, status: 'uploading', fileName: originalFile.name }
          }))
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Simulate successful upload
        const mockResult = {
          id: `doc-${Date.now()}-${index}`,
          name: originalFile.name,
          type: fileExt.toLowerCase(),
          size: formatFileSize(file.size),
          category: category,
          url: URL.createObjectURL(file),
          uploadedBy: user.name || user.email,
          uploadedAt: new Date().toISOString(),
          compressionInfo
        }

        setUploadProgress(prev => ({
          ...prev,
          [index]: { progress: 100, status: 'completed', fileName: originalFile.name }
        }))

        return mockResult
      }

      // Production mode - upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fieldflow-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(prev => ({
              ...prev,
              [index]: { progress: percentage, status: 'uploading', fileName: originalFile.name }
            }))
          }
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fieldflow-documents')
        .getPublicUrl(filePath)

      // Save document metadata to database
      const { data: docData, error: dbError } = await supabase
        .from('documents_ff2024')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: originalFile.name,
          type: fileExt.toLowerCase(),
          size: formatFileSize(file.size),
          category: category,
          url: publicUrl,
          uploaded_by: user.name || user.email,
          metadata: compressionInfo ? {
            compressed: true,
            originalSize: compressionInfo.originalSize,
            compressedSize: compressionInfo.compressedSize,
            compressionRatio: compressionInfo.compressionRatio
          } : null
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update progress
      setUploadProgress(prev => ({
        ...prev,
        [index]: { progress: 100, status: 'completed', fileName: originalFile.name }
      }))

      return {
        id: docData.id,
        name: originalFile.name,
        type: fileExt.toLowerCase(),
        size: formatFileSize(file.size),
        category: category,
        url: publicUrl,
        uploadedBy: user.name || user.email,
        uploadedAt: docData.uploaded_at,
        compressionInfo
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(prev => ({
        ...prev,
        [index]: { progress: 0, status: 'error', error: error.message, fileName: originalFile.name }
      }))
      throw error
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = selectedFiles.map((fileData, index) =>
        uploadFile(fileData, index)
      )

      const results = await Promise.allSettled(uploadPromises)
      const successful = []
      const failed = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push({
            file: selectedFiles[index].originalFile.name,
            error: result.reason.message
          })
        }
      })

      if (successful.length > 0) {
        onUploadComplete?.(successful)
      }

      if (failed.length > 0) {
        const errorMessage = failed.map(f => `${f.file}: ${f.error}`).join('\n')
        onUploadError?.(errorMessage)
      }

      // Reset state after a short delay to show completion status
      setTimeout(() => {
        setSelectedFiles([])
        setUploadProgress({})
      }, 2000)

    } catch (error) {
      console.error('Upload failed:', error)
      onUploadError?.('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }

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
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          <SafeIcon icon={FiUpload} className="w-8 h-8 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {acceptedTypes.includes('image/*') ? 'Images, ' : ''}PDF, DOC, XLS files up to {maxSizeInMB}MB
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📸 Images are automatically compressed to save space
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {selectedFiles.map((fileData, index) => {
              const { file, originalFile, compressionInfo } = fileData
              const progress = uploadProgress[index]
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <SafeIcon icon={getFileIcon(file.type)} className="w-5 h-5 text-gray-500" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {originalFile.name}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        
                        {compressionInfo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <SafeIcon icon={FiCompress} className="w-3 h-3 mr-1" />
                            -{compressionInfo.compressionRatio}% smaller
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {progress && (
                        <div className="mt-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  progress.status === 'completed' ? 'bg-green-500' :
                                  progress.status === 'error' ? 'bg-red-500' :
                                  progress.status === 'compressing' ? 'bg-yellow-500' :
                                  'bg-primary-500'
                                }`}
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            
                            {progress.status === 'completed' && (
                              <SafeIcon icon={FiCheck} className="w-3 h-3 text-green-500" />
                            )}
                            {progress.status === 'error' && (
                              <SafeIcon icon={FiAlertTriangle} className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-1">
                            {progress.status === 'compressing' && 'Compressing image...'}
                            {progress.status === 'uploading' && `Uploading... ${progress.progress}%`}
                            {progress.status === 'completed' && 'Upload complete'}
                            {progress.status === 'error' && progress.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!uploading && !progress && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="btn-primary py-2 px-6 flex items-center disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader