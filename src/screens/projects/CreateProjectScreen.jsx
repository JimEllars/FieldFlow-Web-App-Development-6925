import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiArrowLeft, FiSave, FiPlus, FiTrash2 } = FiIcons

const CreateProjectScreen = () => {
  const navigate = useNavigate()
  const { createProject } = useData()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
    address: '',
    team: []
  })

  const [teamMember, setTeamMember] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTeamMember = () => {
    if (!teamMember.trim()) return
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, teamMember.trim()]
    }))
    setTeamMember('')
  }

  const handleRemoveTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    if (!formData.client.trim()) {
      setError('Client name is required')
      return
    }

    setLoading(true)
    try {
      const projectData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        spent: 0,
        progress: 0
      }

      const newProject = await createProject(projectData)
      navigate(`/app/projects/${newProject.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/projects"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Project
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Client */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client *
              </label>
              <input
                id="client"
                name="client"
                type="text"
                value={formData.client}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget ($)
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project address"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Describe the project scope and details"
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Team Members
          </h2>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              className="input-field"
              placeholder="Enter team member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
            />
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="btn-secondary py-2 px-3"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.team.length > 0 ? (
            <div className="space-y-2">
              {formData.team.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No team members added yet
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProjectScreen