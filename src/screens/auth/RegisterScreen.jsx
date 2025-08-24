import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiUser, FiMail, FiLock, FiBuilding, FiEye, FiEyeOff, FiLoader, FiCheckCircle } = FiIcons

const RegisterScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  
  // Check if demo data was passed from login screen
  const demoData = location.state?.demoData

  const [formData, setFormData] = useState({
    name: demoData?.name || '',
    email: demoData?.email || '',
    company: demoData?.company || '',
    password: demoData?.password || '',
    confirmPassword: demoData?.password || ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Auto-fill form if demo data is provided
  useEffect(() => {
    if (demoData) {
      setFormData({
        name: demoData.name,
        email: demoData.email,
        company: demoData.company,
        password: demoData.password,
        confirmPassword: demoData.password
      })
    }
  }, [demoData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.company || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const result = await register(formData)
    if (result.success) {
      if (result.requiresConfirmation) {
        setSuccess(result.message)
      } else {
        // Registration successful, navigate to dashboard
        navigate('/app/dashboard')
      }
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Account Created Successfully!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {success}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {demoData ? 
              'Demo account created successfully! You can now sign in with the demo credentials.' :
              'Once you\'ve confirmed your email, you can sign in to start using FieldFlow.'
            }
          </p>
        </div>

        <Link
          to="/auth/login"
          className="w-full btn-primary text-center inline-block"
        >
          {demoData ? 'Sign In to Demo Account' : 'Back to sign in'}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {demoData ? 'Create Demo Account' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {demoData ? 'Setting up your FieldFlow demo account' : 'Get started with FieldFlow today'}
        </p>
      </div>

      {demoData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            🚀 Creating demo account with sample construction project data
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiBuilding} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your company name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiLock} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10 pr-10"
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <SafeIcon
                icon={showPassword ? FiEyeOff : FiEye}
                className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiLock} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field pl-10 pr-10"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <SafeIcon
                icon={showConfirmPassword ? FiEyeOff : FiEye}
                className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <SafeIcon icon={FiLoader} className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            demoData ? 'Create Demo Account' : 'Create account'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterScreen