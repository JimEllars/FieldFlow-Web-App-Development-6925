import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { useFormValidation } from '../../hooks/useFormValidation'
import { validators } from '../../utils/validation'
import PhotoCapture from '../../components/common/PhotoCapture'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiCamera, FiAlertTriangle } = FiIcons

const CreateDailyLogScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { data, createDailyLog } = useDataStore()
  const addNotification = useAppStore(state => state.addNotification)

  // Get project ID from query params if available
  const queryParams = new URLSearchParams(location.search)
  const projectIdParam = queryParams.get('projectId')

  const today = new Date().toISOString().split('T')[0]
  const currentWeather = 'Sunny, 75°F' // This would normally come from a weather API

  const initialValues = {
    projectId: projectIdParam || '',
    date: today,
    weather: currentWeather,
    workCompleted: '',
    notes: '',
    crew: [],
    materials: [],
    equipment: [],
    photos: []
  }

  // Validation rules for daily log
  const dailyLogValidationRules = {
    projectId: [validators.required],
    workCompleted: [validators.required, validators.minLength(10)]
  }

  const {
    values: formData,
    errors,
    touched,
    isFormValid,
    setValue,
    setFieldTouched,
    handleSubmit,
    getFieldProps
  } = useFormValidation(initialValues, dailyLogValidationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  })

  const [crewMember, setCrewMember] = useState('')
  const [material, setMaterial] = useState({ item: '', quantity: '', unit: '' })
  const [equipment, setEquipment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)

  const handleFieldChange = (name, value) => {
    setValue(name, value)
  }

  const handleAddCrew = () => {
    if (!crewMember.trim()) return
    
    const newCrew = [...formData.crew, crewMember.trim()]
    handleFieldChange('crew', newCrew)
    setCrewMember('')
  }

  const handleRemoveCrew = (index) => {
    const newCrew = formData.crew.filter((_, i) => i !== index)
    handleFieldChange('crew', newCrew)
  }

  const handleAddMaterial = () => {
    if (!material.item.trim() || !material.quantity || !material.unit.trim()) return
    
    const newMaterials = [...formData.materials, { ...material }]
    handleFieldChange('materials', newMaterials)
    setMaterial({ item: '', quantity: '', unit: '' })
  }

  const handleRemoveMaterial = (index) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index)
    handleFieldChange('materials', newMaterials)
  }

  const handleAddEquipment = () => {
    if (!equipment.trim()) return
    
    const newEquipment = [...formData.equipment, equipment.trim()]
    handleFieldChange('equipment', newEquipment)
    setEquipment('')
  }

  const handleRemoveEquipment = (index) => {
    const newEquipment = formData.equipment.filter((_, i) => i !== index)
    handleFieldChange('equipment', newEquipment)
  }

  const handlePhotoCapture = (capturedPhotos) => {
    const newPhotos = [...formData.photos, ...capturedPhotos]
    handleFieldChange('photos', newPhotos)
    setShowPhotoCapture(false)
  }

  const handleRemovePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    handleFieldChange('photos', newPhotos)
  }

  const onSubmit = handleSubmit(async (validatedData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Add submission details
      const logData = {
        ...validatedData,
        submittedBy: user?.name || user?.email || 'Unknown User',
        submittedAt: new Date().toISOString()
      }

      const result = await createDailyLog(logData, {
        onSuccess: (log) => {
          addNotification({
            type: 'success',
            title: 'Daily Log Created',
            message: 'Daily log has been saved successfully'
          })
          navigate('/app/daily-logs')
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Failed to Create Daily Log',
            message: error.message
          })
        }
      })

      return result
    } catch (error) {
      console.error('Error creating daily log:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Create Daily Log',
        message: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  const getFieldInputProps = (name) => {
    const baseProps = getFieldProps(name)
    return {
      ...baseProps,
      className: `input-field ${
        errors[name] && touched[name] ? 'border-red-500 focus:ring-red-500' : ''
      }`,
      'aria-invalid': errors[name] && touched[name] ? 'true' : 'false',
      'aria-describedby': errors[name] && touched[name] ? `${name}-error` : undefined
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
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Selection */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select
                id="projectId"
                {...getFieldInputProps('projectId')}
                required
              >
                <option value="">Select a project</option>
                {data.projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && touched.projectId && (
                <p id="projectId-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.projectId}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                {...getFieldInputProps('date')}
              />
            </div>

            {/* Weather */}
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weather Conditions
              </label>
              <input
                id="weather"
                type="text"
                placeholder="e.g., Sunny, 75°F"
                {...getFieldInputProps('weather')}
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
              placeholder="Describe the work completed today"
              className={`input-field min-h-[100px] ${
                errors.workCompleted && touched.workCompleted ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              value={formData.workCompleted}
              onChange={(e) => handleFieldChange('workCompleted', e.target.value)}
              onBlur={() => setFieldTouched('workCompleted')}
              required
            />
            {errors.workCompleted && touched.workCompleted && (
              <p id="workCompleted-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                {errors.workCompleted}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              placeholder="Any additional notes, issues, or observations"
              className="input-field min-h-[80px]"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              onBlur={() => setFieldTouched('notes')}
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
                onError={(error) => {
                  addNotification({
                    type: 'error',
                    title: 'Photo Error',
                    message: error
                  })
                }}
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
            disabled={isSubmitting || !isFormValid}
            className="btn-primary py-3 px-8 flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
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

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && !isFormValid && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default CreateDailyLogScreen