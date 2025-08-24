import React, { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiCamera, FiX, FiRotateCcw, FiCheck, FiImage } = FiIcons

const PhotoCapture = ({
  projectId,
  onPhotoCapture,
  onError,
  category = 'photos',
  maxPhotos = 10
}) => {
  const { user } = useAuth()
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
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
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const photo = {
          id: Date.now().toString(),
          blob,
          url: URL.createObjectURL(blob),
          timestamp: new Date().toISOString()
        }
        
        setCapturedPhotos(prev => [...prev, photo])
      }
    }, 'image/jpeg', 0.8)
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

  const uploadPhotos = async () => {
    if (capturedPhotos.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = capturedPhotos.map(async (photo, index) => {
        // Generate unique filename
        const fileName = `photo-${Date.now()}-${index}.jpg`
        const filePath = `${user.id}/${projectId}/${category}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fieldflow-documents')
          .upload(filePath, photo.blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('fieldflow-documents')
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
            uploaded_by: user.name || user.email
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
          uploadedAt: docData.uploaded_at
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
      stopCamera()
      onPhotoCapture?.(results)

    } catch (error) {
      console.error('Error uploading photos:', error)
      onError?.('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const photo = {
          id: Date.now().toString() + Math.random(),
          blob: file,
          url: URL.createObjectURL(file),
          timestamp: new Date().toISOString()
        }
        
        setCapturedPhotos(prev => [...prev, photo])
      }
    })
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
            {capturedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Captured"
                  className="w-full h-24 object-cover rounded-lg"
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <SafeIcon icon={FiX} className="w-3 h-3" />
                </button>
              </div>
            ))}
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
                  Uploading...
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
          📸 Tip: Photos include location data and timestamps for accurate project documentation.
        </p>
      </div>
    </div>
  )
}

export default PhotoCapture