import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiMail, FiArrowLeft, FiLoader, FiCheckCircle } = FiIcons

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { forgotPassword, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const result = await forgotPassword(email)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to send reset email')
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Check your email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>

        <Link
          to="/auth/login"
          className="w-full btn-primary text-center inline-block"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <SafeIcon icon={FiLoader} className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <Link
        to="/auth/login"
        className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
        Back to sign in
      </Link>
    </div>
  )
}

export default ForgotPasswordScreen