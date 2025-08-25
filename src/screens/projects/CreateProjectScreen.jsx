import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { useOptimisticForm } from '../../components/common/OptimisticUI'
import { useFormValidation } from '../../hooks/useFormValidation'
import { commonValidationRules } from '../../utils/validation'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiCheckCircle, FiAlertTriangle } = FiIcons

const CreateProjectScreen = () => {
  const navigate = useNavigate()
  const { createProject } = useData()
  const { user } = useAuth()

  // Form state with enhanced validation
  const initialValues = {
    name: '',
    description: '',
    client: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
    address: '',
    team: []
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
  } = useFormValidation(initialValues, commonValidationRules.project, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  })

  // Optimistic form submission with enhanced feedback
  const { isSubmitting, submitError, submitCreate, clearError } = useOptimisticForm('projects')
  const [teamMember, setTeamMember] = useState('')

  const handleFieldChange = (name, value) => {
    setValue(name, value)
    if (submitError) clearError()
  }

  const handleAddTeamMember = () => {
    if (!teamMember.trim()) return
    const newTeam = [...formData.team, teamMember.trim()]
    handleFieldChange('team', newTeam)
    setTeamMember('')
  }

  const handleRemoveTeamMember = (index) => {
    const newTeam = formData.team.filter((_, i) => i !== index)
    handleFieldChange('team', newTeam)
  }

  const onSubmit = handleSubmit(async (validatedData) => {
    const projectData = {
      ...validatedData,
      budget: parseFloat(validatedData.budget) || 0,
      spent: 0,
      progress: 0,
      createdBy: user?.name || user?.email || 'Unknown User'
    }

    const result = await submitCreate(projectData, {
      priority: 'high', // New projects are high priority
      onSuccess: (project) => {
        navigate(`/app/projects/${project.id}`)
      },
      onError: (error) => {
        console.error('Failed to create project:', error)
      }
    })

    return result
  })

  const getFieldInputProps = (name) => {
    const baseProps = getFieldProps(name)
    return {
      ...baseProps,
      className: `input-field ${errors[name] && touched[name] ? 'border-red-500 focus:ring-red-500' : ''}`,
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
            to="/app/projects"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Project
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error Messages */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter project name"
                required
                {...getFieldInputProps('name')}
              />
              {errors.name && touched.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Client */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client *
              </label>
              <input
                id="client"
                type="text"
                placeholder="Enter client name"
                required
                {...getFieldInputProps('client')}
              />
              {errors.client && touched.client && (
                <p id="client-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.client}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select id="status" {...getFieldInputProps('status')}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                id="startDate"
                type="date"
                required
                {...getFieldInputProps('startDate')}
              />
              {errors.startDate && touched.startDate && (
                <p id="startDate-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                id="endDate"
                type="date"
                required
                {...getFieldInputProps('endDate')}
              />
              {errors.endDate && touched.endDate && (
                <p id="endDate-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget ($)
              </label>
              <input
                id="budget"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                {...getFieldInputProps('budget')}
              />
              {errors.budget && touched.budget && (
                <p id="budget-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.budget}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter project address"
                {...getFieldInputProps('address')}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe the project scope and details"
                className={`input-field min-h-[100px] ${errors.description && touched.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => setFieldTouched('description')}
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Team Members
          </h2>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              className="input-field"
              placeholder="Enter team member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
            />
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="btn-secondary py-2 px-3"
              disabled={!teamMember.trim()}
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.team.length > 0 ? (
            <div className="space-y-2">
              {formData.team.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No team members added yet
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
                Creating...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Create Project
              </>
            )}
          </button>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && !isFormValid && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
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

export default CreateProjectScreen