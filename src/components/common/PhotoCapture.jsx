import React, { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { compressImage } from '../../utils/imageCompression'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiCamera, FiX, FiRotateCcw, FiCheck, FiImage, FiCompress } = FiIcons

const PhotoCapture = ({ projectId, onPhotoCapture, onError, category = 'photos', maxPhotos = 10 }) => {
  const { user, testMode } = useAuth()
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState({})
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      onError?.('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob with initial quality
    canvas.toBlob((blob) => {
      if (blob) {
        const photo = {
          id: Date.now().toString(),
          blob,
          url: URL.createObjectURL(blob),
          timestamp: new Date().toISOString(),
          originalSize: blob.size,
          compressed: false
        }
        setCapturedPhotos(prev => [...prev, photo])
      }
    }, 'image/jpeg', 0.9)
  }

  const removePhoto = (photoId) => {
    setCapturedPhotos(prev => {
      const photo = prev.find(p => p.id === photoId)
      if (photo?.url) {
        URL.revokeObjectURL(photo.url)
      }
      return prev.filter(p => p.id !== photoId)
    })
  }

  const compressPhotos = async (photos) => {
    const compressedPhotos = []
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      try {
        setCompressionProgress(prev => ({
          ...prev,
          [photo.id]: { status: 'compressing', progress: 0 }
        }))

        // Create a File object from the blob
        const file = new File([photo.blob], `photo-${photo.id}.jpg`, { type: 'image/jpeg' })
        
        // Compress the image
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.8
        })

        const compressedPhoto = {
          ...photo,
          blob: compressedFile,
          compressedSize: compressedFile.size,
          compressed: true,
          compressionRatio: ((photo.originalSize - compressedFile.size) / photo.originalSize * 100).toFixed(1)
        }

        compressedPhotos.push(compressedPhoto)

        setCompressionProgress(prev => ({
          ...prev,
          [photo.id]: { status: 'completed', progress: 100 }
        }))

      } catch (error) {
        console.error('Error compressing photo:', error)
        // Use original photo if compression fails
        compressedPhotos.push(photo)
        
        setCompressionProgress(prev => ({
          ...prev,
          [photo.id]: { status: 'error', progress: 0 }
        }))
      }
    }

    return compressedPhotos
  }

  const uploadPhotos = async () => {
    if (capturedPhotos.length === 0) return

    setUploading(true)
    
    try {
      // Compress photos first
      const photosToUpload = await compressPhotos(capturedPhotos)

      if (testMode) {
        // Test mode - simulate upload
        const mockResults = photosToUpload.map((photo, index) => ({
          id: `photo-${Date.now()}-${index}`,
          name: `Photo ${new Date().toLocaleString()}`,
          type: 'jpg',
          size: `${Math.round(photo.blob.size / 1024)} KB`,
          category: category,
          url: photo.url,
          uploadedBy: user.name || user.email,
          uploadedAt: new Date().toISOString(),
          compressed: photo.compressed,
          compressionRatio: photo.compressionRatio
        }))

        onPhotoCapture?.(mockResults)
        setCapturedPhotos([])
        stopCamera()
        return
      }

      // Production mode - upload to Supabase
      const uploadPromises = photosToUpload.map(async (photo, index) => {
        // Generate unique filename
        const fileName = `photo-${Date.now()}-${index}.jpg`
        const filePath = `${user.id}/${projectId}/${category}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('foremanos-documents')
          .upload(filePath, photo.blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('foremanos-documents')
          .getPublicUrl(filePath)

        // Save document metadata
        const { data: docData, error: dbError } = await supabase
          .from('documents_ff2024')
          .insert({
            project_id: projectId,
            user_id: user.id,
            name: `Photo ${new Date().toLocaleString()}`,
            type: 'jpg',
            size: `${Math.round(photo.blob.size / 1024)} KB`,
            category: category,
            url: publicUrl,
            uploaded_by: user.name || user.email,
            metadata: {
              compressed: photo.compressed,
              originalSize: photo.originalSize,
              compressedSize: photo.compressedSize,
              compressionRatio: photo.compressionRatio
            }
          })
          .select()
          .single()

        if (dbError) throw dbError

        return {
          id: docData.id,
          name: `Photo ${new Date().toLocaleString()}`,
          type: 'jpg',
          size: `${Math.round(photo.blob.size / 1024)} KB`,
          category: category,
          url: publicUrl,
          uploadedBy: user.name || user.email,
          uploadedAt: docData.uploaded_at,
          compressed: photo.compressed,
          compressionRatio: photo.compressionRatio
        }
      })

      const results = await Promise.all(uploadPromises)

      // Clean up blob URLs
      capturedPhotos.forEach(photo => {
        if (photo.url) {
          URL.revokeObjectURL(photo.url)
        }
      })

      setCapturedPhotos([])
      setCompressionProgress({})
      stopCamera()
      onPhotoCapture?.(results)

    } catch (error) {
      console.error('Error uploading photos:', error)
      onError?.('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Compress the uploaded file
          const compressedFile = await compressImage(file)
          
          const photo = {
            id: Date.now().toString() + Math.random(),
            blob: compressedFile,
            url: URL.createObjectURL(compressedFile),
            timestamp: new Date().toISOString(),
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressed: file.size !== compressedFile.size,
            compressionRatio: file.size !== compressedFile.size ? 
              ((file.size - compressedFile.size) / file.size * 100).toFixed(1) : '0'
          }
          
          setCapturedPhotos(prev => [...prev, photo])
        } catch (error) {
          console.error('Error processing uploaded file:', error)
          onError?.('Failed to process uploaded image.')
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Camera Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Photo Capture
        </h3>
        <div className="flex items-center space-x-2">
          {/* File Upload Option */}
          <label className="btn-secondary py-2 px-3 cursor-pointer">
            <SafeIcon icon={FiImage} className="w-4 h-4 mr-1" />
            <span className="text-sm">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Camera Toggle */}
          {!isCapturing ? (
            <button
              onClick={startCamera}
              className="btn-primary py-2 px-3 flex items-center"
            >
              <SafeIcon icon={FiCamera} className="w-4 h-4 mr-1" />
              <span className="text-sm">Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="btn-secondary py-2 px-3 flex items-center"
            >
              <SafeIcon icon={FiX} className="w-4 h-4 mr-1" />
              <span className="text-sm">Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera View */}
      {isCapturing && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          
          {/* Capture Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={capturePhoto}
              disabled={capturedPhotos.length >= maxPhotos}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiCamera} className="w-8 h-8 text-gray-700" />
            </button>
          </div>

          {/* Photo Counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {capturedPhotos.length}/{maxPhotos}
          </div>
        </div>
      )}

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Photos */}
      {capturedPhotos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Captured Photos ({capturedPhotos.length})
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {capturedPhotos.map((photo) => {
              const compressionStatus = compressionProgress[photo.id]
              
              return (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt="Captured"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  
                  {/* Compression Status */}
                  {photo.compressed && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      <SafeIcon icon={FiCompress} className="w-3 h-3 inline mr-1" />
                      -{photo.compressionRatio}%
                    </div>
                  )}
                  
                  {/* Compression Progress */}
                  {compressionStatus && compressionStatus.status === 'compressing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-xs">Compressing...</div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  {!uploading && !compressionStatus && (
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <SafeIcon icon={FiX} className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={uploadPhotos}
              disabled={uploading || capturedPhotos.length === 0}
              className="btn-primary py-2 px-6 flex items-center disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
                  Upload {capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          📸 <strong>Smart Compression:</strong> Photos are automatically compressed to save storage and improve upload speed. 
          Large images are resized to 1920px max and compressed to reduce file size by up to 70%.
        </p>
      </div>
    </div>
  )
}

export default PhotoCapture