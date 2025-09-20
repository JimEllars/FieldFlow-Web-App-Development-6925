import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiTestTube } = FiIcons

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading, testMode } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    const result = await login(formData.email, formData.password)
    if (result.success) {
      navigate('/app/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDemoLogin = async () => {
    setError('')
    
    // Set demo credentials
    const demoEmail = 'demo@foremanos.com'
    const demoPassword = 'demo123456'
    
    setFormData({
      email: demoEmail,
      password: demoPassword
    })

    // Attempt login with demo credentials
    const result = await login(demoEmail, demoPassword)
    if (result.success) {
      navigate('/app/dashboard')
    } else {
      setError(result.error || 'Demo login failed')
    }
  }

  const handleTestLogin = async () => {
    setError('')
    
    // Set test credentials
    const testEmail = 'test@example.com'
    const testPassword = 'password'
    
    setFormData({
      email: testEmail,
      password: testPassword
    })

    // Attempt login with test credentials
    const result = await login(testEmail, testPassword)
    if (result.success) {
      navigate('/app/dashboard')
    } else {
      setError(result.error || 'Test login failed')
    }
  }

  const handleCreateDemoAccount = async () => {
    setError('')
    
    // Navigate to register page with pre-filled demo data
    navigate('/auth/register', {
      state: {
        demoData: {
          name: 'John Contractor',
          email: 'demo@foremanos.com',
          company: 'Demo Construction Co.',
          password: 'demo123456'
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Sign in to your ForemanOS account
        </p>
        {testMode && (
          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <SafeIcon icon={FiTestTube} className="w-3 h-3 mr-1" />
            Test Mode Active
          </div>
        )}
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
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <SafeIcon icon={FiLoader} className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Test Mode Quick Login */}
      {testMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              🧪 Test Mode - Quick Login
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">
              In test mode, you can sign in with any email and password combination
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Quick Test Login'}
            </button>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Demo Login'}
            </button>
          </div>
          
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Just fill in any email/password above and click "Sign in", or use the quick buttons
          </p>
        </div>
      )}

      {/* Demo Credentials - Always show for convenience */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            🚀 Try the Demo
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
            Experience ForemanOS with sample construction project data
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-300 mb-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
            <strong>Demo Credentials:</strong><br />
            Email: demo@foremanos.com<br />
            Password: demo123456
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={handleCreateDemoAccount}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            Create Demo Account
          </button>
        </div>
        
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {testMode ? 'In test mode, any credentials work!' : 'Create demo account if needed'}
        </p>
      </div>
    </div>
  )
}

export default LoginScreen