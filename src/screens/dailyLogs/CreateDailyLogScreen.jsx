import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import PhotoCapture from '../../components/common/PhotoCapture'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiCamera } = FiIcons

const CreateDailyLogScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { data, createDailyLog } = useData()
  
  // Get project ID from query params if available
  const queryParams = new URLSearchParams(location.search)
  const projectIdParam = queryParams.get('projectId')
  
  const today = new Date().toISOString().split('T')[0]
  const currentWeather = 'Sunny, 75°F' // This would normally come from a weather API

  const [formData, setFormData] = useState({
    projectId: projectIdParam || '',
    date: today,
    weather: currentWeather,
    workCompleted: '',
    notes: '',
    crew: [],
    materials: [],
    equipment: [],
    photos: [] // Will store photo URLs and metadata
  })

  const [crewMember, setCrewMember] = useState('')
  const [material, setMaterial] = useState({ item: '', quantity: '', unit: '' })
  const [equipment, setEquipment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddCrew = () => {
    if (!crewMember.trim()) return
    setFormData(prev => ({
      ...prev,
      crew: [...prev.crew, crewMember.trim()]
    }))
    setCrewMember('')
  }

  const handleRemoveCrew = (index) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.filter((_, i) => i !== index)
    }))
  }

  const handleAddMaterial = () => {
    if (!material.item.trim() || !material.quantity || !material.unit.trim()) return
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { ...material }]
    }))
    setMaterial({ item: '', quantity: '', unit: '' })
  }

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const handleAddEquipment = () => {
    if (!equipment.trim()) return
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, equipment.trim()]
    }))
    setEquipment('')
  }

  const handleRemoveEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }))
  }

  const handlePhotoCapture = (capturedPhotos) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...capturedPhotos]
    }))
    setShowPhotoCapture(false)
  }

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.projectId) {
      setError('Please select a project')
      return
    }

    if (!formData.workCompleted.trim()) {
      setError('Please describe the work completed')
      return
    }

    setLoading(true)
    
    try {
      // Add submission details
      const logData = {
        ...formData,
        submittedBy: user?.name || user?.email || 'Unknown User',
        submittedAt: new Date().toISOString()
      }

      await createDailyLog(logData)
      navigate('/app/daily-logs')
    } catch (error) {
      console.error('Error creating daily log:', error)
      setError('Failed to create daily log')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/daily-logs"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create Daily Log
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Selection */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
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

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Weather */}
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weather Conditions
              </label>
              <input
                id="weather"
                name="weather"
                type="text"
                value={formData.weather}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Sunny, 75°F"
              />
            </div>
          </div>

          {/* Work Completed */}
          <div className="mt-4">
            <label htmlFor="workCompleted" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Completed Today *
            </label>
            <textarea
              id="workCompleted"
              name="workCompleted"
              value={formData.workCompleted}
              onChange={handleChange}
              className="input-field min-h-[100px]"
              placeholder="Describe the work completed today"
              required
            />
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field min-h-[80px]"
              placeholder="Any additional notes, issues, or observations"
            />
          </div>
        </div>

        {/* Photo Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Project Photos
            </h2>
            <button
              type="button"
              onClick={() => setShowPhotoCapture(!showPhotoCapture)}
              className="btn-secondary py-2 px-3 flex items-center"
            >
              <SafeIcon icon={FiCamera} className="w-4 h-4 mr-1" />
              {showPhotoCapture ? 'Hide Camera' : 'Add Photos'}
            </button>
          </div>

          {showPhotoCapture && formData.projectId && (
            <div className="mb-4">
              <PhotoCapture
                projectId={formData.projectId}
                category="daily-logs"
                onPhotoCapture={handlePhotoCapture}
                onError={setError}
                maxPhotos={10}
              />
            </div>
          )}

          {/* Photo Gallery */}
          {formData.photos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attached Photos ({formData.photos.length})
              </h4>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Crew Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Crew Members
          </h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={crewMember}
              onChange={(e) => setCrewMember(e.target.value)}
              className="input-field"
              placeholder="Enter crew member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCrew())}
            />
            <button
              type="button"
              onClick={handleAddCrew}
              className="btn-secondary py-2 px-3"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.crew.length > 0 ? (
            <div className="space-y-2">
              {formData.crew.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCrew(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No crew members added yet
            </p>
          )}
        </div>

        {/* Materials Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Materials Used
          </h2>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <input
              type="text"
              value={material.item}
              onChange={(e) => setMaterial({ ...material, item: e.target.value })}
              className="input-field col-span-3 sm:col-span-1"
              placeholder="Material name"
            />
            <input
              type="number"
              value={material.quantity}
              onChange={(e) => setMaterial({ ...material, quantity: e.target.value })}
              className="input-field"
              placeholder="Quantity"
              min="0"
              step="0.01"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={material.unit}
                onChange={(e) => setMaterial({ ...material, unit: e.target.value })}
                className="input-field"
                placeholder="Unit (e.g., ft, pcs)"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="btn-secondary py-2 px-3"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {formData.materials.length > 0 ? (
            <div className="space-y-2">
              {formData.materials.map((mat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">
                    {mat.item}: {mat.quantity} {mat.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No materials added yet
            </p>
          )}
        </div>

        {/* Equipment Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Equipment Used
          </h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="input-field"
              placeholder="Enter equipment name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
            />
            <button
              type="button"
              onClick={handleAddEquipment}
              className="btn-secondary py-2 px-3"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.equipment.length > 0 ? (
            <div className="space-y-2">
              {formData.equipment.map((equip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">{equip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No equipment added yet
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Save Daily Log
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateDailyLogScreen