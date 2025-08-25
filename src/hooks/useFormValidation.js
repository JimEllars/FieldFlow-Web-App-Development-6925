import { useState, useCallback } from 'react'
import { validateField, validateForm } from '../utils/validation'

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

export default useFormValidation