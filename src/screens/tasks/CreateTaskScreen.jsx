import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { useFormValidation } from '../../hooks/useFormValidation'
import { commonValidationRules } from '../../utils/validation'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiAlertTriangle } = FiIcons

const CreateTaskScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { data, createTask } = useDataStore()
  const { user } = useAuthStore()
  const addNotification = useAppStore(state => state.addNotification)

  // Get project ID from query params if available
  const queryParams = new URLSearchParams(location.search)
  const projectIdParam = queryParams.get('projectId')

  const initialValues = {
    projectId: projectIdParam || '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignee: user?.name || '',
    dueDate: '',
    estimatedHours: ''
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
  } = useFormValidation(initialValues, commonValidationRules.task, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (name, value) => {
    setValue(name, value)
  }

  const onSubmit = handleSubmit(async (validatedData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const taskData = {
        ...validatedData,
        estimatedHours: parseFloat(validatedData.estimatedHours) || 0
      }

      const result = await createTask(taskData, {
        onSuccess: (task) => {
          addNotification({
            type: 'success',
            title: 'Task Created',
            message: `${task.title} has been created successfully`
          })
          navigate(`/app/tasks/${task.id}`)
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Failed to Create Task',
            message: error.message
          })
        }
      })

      return result
    } catch (error) {
      console.error('Failed to create task:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Create Task',
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
            to="/app/tasks"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Task
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Selection */}
            <div className="md:col-span-2">
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

            {/* Task Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                required
                {...getFieldInputProps('title')}
              />
              {errors.title && touched.title && (
                <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select id="priority" {...getFieldInputProps('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select id="status" {...getFieldInputProps('status')}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned To *
              </label>
              <input
                id="assignee"
                type="text"
                placeholder="Enter assignee name"
                required
                {...getFieldInputProps('assignee')}
              />
              {errors.assignee && touched.assignee && (
                <p id="assignee-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.assignee}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                id="dueDate"
                type="date"
                required
                {...getFieldInputProps('dueDate')}
              />
              {errors.dueDate && touched.dueDate && (
                <p id="dueDate-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                id="estimatedHours"
                type="number"
                placeholder="0"
                min="0"
                step="0.5"
                {...getFieldInputProps('estimatedHours')}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe the task details and requirements"
                className={`input-field min-h-[120px] ${
                  errors.description && touched.description ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => setFieldTouched('description')}
              />
            </div>
          </div>
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
                Create Task
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

export default CreateTaskScreen