import { useState, useCallback } from 'react'

// Enhanced form validation utilities with comprehensive rules
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return null
  },

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters long'
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
    return null
  },

  confirmPassword: (originalPassword) => (value) => {
    if (value !== originalPassword) {
      return 'Passwords do not match'
    }
    return null
  },

  phone: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  url: (value) => {
    try {
      if (value) {
        new URL(value)
      }
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },

  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Must be a valid number'
    }
    return null
  },

  positiveNumber: (value) => {
    const numValue = Number(value)
    if (value && (isNaN(numValue) || numValue <= 0)) {
      return 'Must be a positive number'
    }
    return null
  },

  date: (value) => {
    if (value && isNaN(Date.parse(value))) {
      return 'Please enter a valid date'
    }
    return null
  },

  futureDate: (value) => {
    if (value) {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) {
        return 'Date must be in the future'
      }
    }
    return null
  },

  pastDate: (value) => {
    if (value) {
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (date > today) {
        return 'Date must be in the past'
      }
    }
    return null
  },

  dateRange: (startDate) => (endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end <= start) {
        return 'End date must be after start date'
      }
    }
    return null
  },

  budget: (value) => {
    const numValue = Number(value)
    if (value && (isNaN(numValue) || numValue < 0)) {
      return 'Budget must be a valid positive number'
    }
    if (numValue > 10000000) {
      return 'Budget cannot exceed $10,000,000'
    }
    return null
  },

  projectName: (value) => {
    if (!value || !value.trim()) {
      return 'Project name is required'
    }
    if (value.length < 3) {
      return 'Project name must be at least 3 characters long'
    }
    if (value.length > 100) {
      return 'Project name cannot exceed 100 characters'
    }
    if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(value)) {
      return 'Project name contains invalid characters'
    }
    return null
  },

  clientName: (value) => {
    if (!value || !value.trim()) {
      return 'Client name is required'
    }
    if (value.length < 2) {
      return 'Client name must be at least 2 characters long'
    }
    if (value.length > 100) {
      return 'Client name cannot exceed 100 characters'
    }
    return null
  },

  address: (value) => {
    if (value && value.length > 200) {
      return 'Address cannot exceed 200 characters'
    }
    return null
  },

  taskTitle: (value) => {
    if (!value || !value.trim()) {
      return 'Task title is required'
    }
    if (value.length < 3) {
      return 'Task title must be at least 3 characters long'
    }
    if (value.length > 100) {
      return 'Task title cannot exceed 100 characters'
    }
    return null
  },

  estimatedHours: (value) => {
    if (value) {
      const numValue = Number(value)
      if (isNaN(numValue) || numValue < 0) {
        return 'Estimated hours must be a positive number'
      }
      if (numValue > 1000) {
        return 'Estimated hours cannot exceed 1000'
      }
    }
    return null
  }
}

// Validate a single field with multiple validators
export const validateField = (value, validatorArray) => {
  for (const validator of validatorArray) {
    const error = validator(value)
    if (error) {
      return error
    }
  }
  return null
}

// Validate an entire form object
export const validateForm = (formData, validationRules) => {
  const errors = {}
  let isValid = true

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName]
    const rules = validationRules[fieldName]
    const error = validateField(value, rules)

    if (error) {
      errors[fieldName] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

/**
 * Enhanced form validation hook with real-time feedback
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {Object} options - Additional options
 * @returns {Object} Form validation utilities
 */
export const useFormValidation = (initialValues, validationRules, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showErrorsOnSubmit = true,
    debounceMs = 300
  } = options

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Debounced validation for performance
  const [validationTimeouts, setValidationTimeouts] = useState({})

  const validateSingleField = useCallback((name, value) => {
    if (validationRules[name]) {
      const error = validateField(value, validationRules[name])
      setErrors(prev => ({ ...prev, [name]: error }))
      return error
    }
    return null
  }, [validationRules])

  const debouncedValidation = useCallback((name, value) => {
    // Clear existing timeout
    if (validationTimeouts[name]) {
      clearTimeout(validationTimeouts[name])
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      validateSingleField(name, value)
    }, debounceMs)

    setValidationTimeouts(prev => ({ ...prev, [name]: timeoutId }))
  }, [validateSingleField, debounceMs, validationTimeouts])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))

    // Validate on change if enabled and field has been touched or submit attempted
    if (validateOnChange && (touched[name] || submitAttempted)) {
      if (debounceMs > 0) {
        debouncedValidation(name, value)
      } else {
        validateSingleField(name, value)
      }
    }
  }, [validateOnChange, touched, submitAttempted, debouncedValidation, validateSingleField, debounceMs])

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))

    // Validate on blur if enabled and field is being touched
    if (validateOnBlur && isTouched && !touched[name]) {
      validateSingleField(name, values[name])
    }
  }, [validateOnBlur, touched, values, validateSingleField])

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])

  const validateAll = useCallback(() => {
    const { isValid, errors: allErrors } = validateForm(values, validationRules)
    setErrors(allErrors)

    // Mark all fields as touched
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
    )

    return isValid
  }, [values, validationRules])

  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      if (event) {
        event.preventDefault()
      }

      setIsSubmitting(true)
      setSubmitAttempted(true)

      const isValid = validateAll()

      if (isValid && onSubmit) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
          // You can set form-level errors here if needed
        }
      }

      setIsSubmitting(false)
    }
  }, [values, validateAll])

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setSubmitAttempted(false)

    // Clear any pending validation timeouts
    Object.values(validationTimeouts).forEach(clearTimeout)
    setValidationTimeouts({})
  }, [initialValues, validationTimeouts])

  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])

  const setFormErrors = useCallback((newErrors) => {
    setErrors(prev => ({ ...prev, ...newErrors }))
  }, [])

  // Computed values
  const isFormValid = Object.keys(errors).every(key => !errors[key])
  const hasErrors = Object.keys(errors).some(key => errors[key])
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)
  const touchedFieldsCount = Object.keys(touched).filter(key => touched[key]).length

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setFieldTouched(name, true),
    error: errors[name],
    touched: touched[name],
    hasError: !!(errors[name] && (touched[name] || submitAttempted))
  }), [values, errors, touched, submitAttempted, setValue, setFieldTouched])

  // Get field state for conditional rendering
  const getFieldState = useCallback((name) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    hasError: !!(errors[name] && (touched[name] || submitAttempted)),
    isValid: !errors[name] && touched[name]
  }), [values, errors, touched, submitAttempted])

  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    submitAttempted,

    // Computed state
    isFormValid,
    hasErrors,
    isDirty,
    touchedFieldsCount,

    // Actions
    setValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    setFormValues,
    setFormErrors,
    validateAll,
    handleSubmit,
    reset,

    // Utilities
    getFieldProps,
    getFieldState,

    // Manual validation
    validateField: validateSingleField
  }
}

// Enhanced validation rule sets for different forms
export const commonValidationRules = {
  login: {
    email: [validators.required, validators.email],
    password: [validators.required]
  },

  register: {
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    email: [validators.required, validators.email],
    company: [validators.required, validators.minLength(2), validators.maxLength(100)],
    password: [validators.required, validators.password]
  },

  project: {
    name: [validators.projectName],
    client: [validators.clientName],
    budget: [validators.budget],
    startDate: [validators.required, validators.date],
    endDate: [validators.required, validators.date],
    address: [validators.address],
    description: [validators.maxLength(1000)]
  },

  task: {
    title: [validators.taskTitle],
    projectId: [validators.required],
    dueDate: [validators.required, validators.date],
    estimatedHours: [validators.estimatedHours],
    assignee: [validators.required, validators.minLength(2)],
    description: [validators.maxLength(500)]
  },

  profile: {
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    company: [validators.required, validators.minLength(2), validators.maxLength(100)],
    phone: [validators.phone]
  },

  dailyLog: {
    projectId: [validators.required],
    date: [validators.required, validators.date],
    workCompleted: [validators.required, validators.minLength(10), validators.maxLength(2000)],
    weather: [validators.maxLength(100)],
    notes: [validators.maxLength(1000)]
  },

  timeEntry: {
    projectId: [validators.required],
    date: [validators.required, validators.date],
    clockIn: [validators.required],
    clockOut: [validators.required],
    description: [validators.maxLength(500)]
  }
}

export default useFormValidation