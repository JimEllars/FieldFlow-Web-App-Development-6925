import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import PullToRefresh from '../../components/common/PullToRefresh'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiFilter, FiPlus, FiChevronRight, FiCalendar, FiDollarSign } = FiIcons

const ProjectsScreen = () => {
  const { user } = useAuthStore()
  const { data, loading, loadAllData, pullToRefresh } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Load data on component mount
  useEffect(() => {
    if (user?.id && data.projects.length === 0) {
      loadAllData(user.id)
    }
  }, [user?.id, data.projects.length, loadAllData])

  // Handle pull to refresh
  const handleRefresh = async () => {
    if (!user?.id || refreshing) return
    
    setRefreshing(true)
    try {
      await pullToRefresh(user.id)
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredProjects = data.projects
    .filter(project => {
      // Apply search filter
      if (searchTerm && 
          !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.client.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply status filter
      if (filter !== 'all' && project.status !== filter) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Sort by status (active first) then by name
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return a.name.localeCompare(b.name)
    })

  if (loading && data.projects.length === 0) {
    return <LoadingSpinner text="Loading projects..." />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Add Project */}
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field py-2 pl-3 pr-8"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
            <Link
              to="/app/projects/new"
              className="btn-primary py-2 px-4 flex items-center"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Add Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Projects List with Pull to Refresh */}
      <PullToRefresh 
        onRefresh={handleRefresh} 
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || filter !== 'all' 
                  ? 'No projects found' 
                  : 'No projects yet'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filter !== 'all'
                  ? 'Try changing your search or filter'
                  : 'Start by creating your first project'
                }
              </p>
              <Link to="/app/projects/new" className="btn-primary inline-flex items-center">
                <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                Add Project
              </Link>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/app/projects/${project.id}`}
                className="card block hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : project.status === 'planning'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {project.client}
                    </p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1" />
                        <span>
                          ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {project.progress}% complete
                        </p>
                        {project.taskCount !== undefined && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {project.completedTasks || 0}/{project.taskCount || 0} tasks
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </Link>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}

export default ProjectsScreen