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
    return null
  },

  confirmPassword: (originalPassword) => (value) => {
    if (value !== originalPassword) {
      return 'Passwords do not match'
    }
    return null
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
    return null
  },

  clientName: (value) => {
    if (!value || !value.trim()) {
      return 'Client name is required'
    }
    if (value.length < 2) {
      return 'Client name must be at least 2 characters long'
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
    startDate: [validators.required, validators.date],
    endDate: [validators.required, validators.date]
  },

  task: {
    title: [validators.required, validators.minLength(3)],
    projectId: [validators.required],
    dueDate: [validators.required, validators.date],
    assignee: [validators.required, validators.minLength(2)]
  }
}

export default validateForm