import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiUser, FiMail, FiBuilding, FiSave, FiCamera } = FiIcons

const ProfileScreen = () => {
  const { user, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    role: user?.role || ''
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setSuccess('Profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Profile
      </h1>
      
      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}
      
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2 border border-gray-200 dark:border-gray-600">
                <SafeIcon icon={FiCamera} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* User Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {user?.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.role} at {user?.company}
            </p>
            
            {user?.subscription && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.subscription.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : user.subscription.status === 'trial'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
                  {user.subscription.status === 'trial' && ' (Trial)'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
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
                  placeholder="Your full name"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
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
                  placeholder="your.email@example.com"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>
            
            {/* Company */}
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
                  placeholder="Your company name"
                />
              </div>
            </div>
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title / Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Owner">Owner</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Foreman">Foreman</option>
                <option value="Field Supervisor">Field Supervisor</option>
                <option value="Office Manager">Office Manager</option>
                <option value="Crew Member">Crew Member</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2 px-6 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Account Security */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account Security
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Change your password to keep your account secure.
            </p>
            <button
              type="button"
              className="btn-secondary py-2 px-4 text-sm"
            >
              Change Password
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Add an extra layer of security to your account.
            </p>
            <button
              type="button"
              className="btn-secondary py-2 px-4 text-sm"
            >
              Setup Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Preferences */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notification Preferences
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive updates about projects, tasks, and daily logs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive real-time alerts on your mobile device
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen