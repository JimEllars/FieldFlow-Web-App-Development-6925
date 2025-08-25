// Form validation utilities

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

// Real-time validation hook
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateSingleField = useCallback((name, value) => {
    if (validationRules[name]) {
      const error = validateField(value, validationRules[name])
      setErrors(prev => ({ ...prev, [name]: error }))
      return error
    }
    return null
  }, [validationRules])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Validate if field has been touched
    if (touched[name]) {
      validateSingleField(name, value)
    }
  }, [touched, validateSingleField])

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
    
    // Validate when field is touched for the first time
    if (isTouched && !touched[name]) {
      validateSingleField(name, values[name])
    }
  }, [touched, values, validateSingleField])

  const validateAll = useCallback(() => {
    const { isValid, errors: allErrors } = validateForm(values, validationRules)
    setErrors(allErrors)
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))
    return isValid
  }, [values, validationRules])

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const isFormValid = Object.keys(errors).every(key => !errors[key])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isFormValid
  }
}

// Common validation rule sets
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
    name: [validators.required, validators.minLength(3), validators.maxLength(100)],
    client: [validators.required, validators.minLength(2), validators.maxLength(100)],
    budget: [validators.positiveNumber],
    startDate: [validators.required, validators.date],
    endDate: [validators.required, validators.date]
  },

  task: {
    title: [validators.required, validators.minLength(3), validators.maxLength(100)],
    projectId: [validators.required],
    dueDate: [validators.required, validators.date],
    estimatedHours: [validators.positiveNumber]
  },

  profile: {
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    company: [validators.required, validators.minLength(2), validators.maxLength(100)]
  }
}