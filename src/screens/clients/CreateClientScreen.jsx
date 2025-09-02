import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { clientService } from '../../services/clientService'
import { useFormValidation } from '../../hooks/useFormValidation'
import { validators } from '../../utils/validation'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiAlertTriangle } = FiIcons

const CreateClientScreen = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const initialValues = {
    name: '',
    email: '',
    phone_number: '',
    address: '',
    notes: ''
  }

  const clientValidationRules = {
    name: [validators.required, validators.minLength(2)],
    email: [validators.email],
    phone_number: [],
    address: [],
    notes: []
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
  } = useFormValidation(initialValues, clientValidationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  })

  const handleFieldChange = (name, value) => {
    setValue(name, value)
  }

  const onSubmit = handleSubmit(async (validatedData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const clientData = {
        ...validatedData,
        company_id: user.company_id
      }
      
      const newClient = await clientService.create(clientData)
      navigate(`/app/clients/${newClient.id}`)
    } catch (error) {
      console.error('Failed to create client:', error)
      setSubmitError(error.message || 'Failed to create client')
    } finally {
      setIsSubmitting(false)
    }
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
            to="/app/clients"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add New Client
          </h1>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Client Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2" />
                Client Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter client name"
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="client@example.com"
                {...getFieldInputProps('email')}
              />
              {errors.email && touched.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                id="phone_number"
                type="tel"
                placeholder="(555) 123-4567"
                {...getFieldInputProps('phone_number')}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="123 Main St, City, State 12345"
                {...getFieldInputProps('address')}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <SafeIcon icon={FiFileText} className="w-4 h-4 inline mr-2" />
                Notes
              </label>
              <textarea
                id="notes"
                placeholder="Add any additional notes about this client..."
                className={`input-field min-h-[100px] ${errors.notes && touched.notes ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                onBlur={() => setFieldTouched('notes')}
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
                Create Client
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

export default CreateClientScreen