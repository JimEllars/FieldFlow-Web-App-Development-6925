import imageCompression from 'browser-image-compression'

/**
 * Compress and resize images before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true, // Use web worker for better performance
    fileType: 'image/jpeg', // Convert to JPEG for better compression
    quality: 0.8 // Image quality (0-1)
  }

  const compressionOptions = { ...defaultOptions, ...options }

  try {
    // Only compress if it's an image file
    if (!file.type.startsWith('image/')) {
      return file
    }

    // Skip compression for small files (under 500KB)
    if (file.size < 500 * 1024) {
      return file
    }

    console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    
    const compressedFile = await imageCompression(file, compressionOptions)
    
    console.log(`Compression complete: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
    
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export const compressImages = async (files, options = {}) => {
  const compressionPromises = files.map(file => compressImage(file, options))
  return Promise.all(compressionPromises)
}

export default compressImage