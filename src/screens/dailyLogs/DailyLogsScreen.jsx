import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import PullToRefresh from '../../components/common/PullToRefresh'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiFilter, FiFileText, FiCalendar, FiUser } = FiIcons

const DailyLogsScreen = () => {
  const { user } = useAuthStore()
  const { data, loading, loadAllData, pullToRefresh } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, project-1, project-2, etc.
  const [refreshing, setRefreshing] = useState(false)

  // Load data on component mount
  useEffect(() => {
    if (user?.id && data.dailyLogs.length === 0) {
      loadAllData(user.id)
    }
  }, [user?.id, data.dailyLogs.length, loadAllData])

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

  const filteredLogs = data.dailyLogs
    .filter(log => {
      // Apply search filter
      if (searchTerm && 
          !log.workCompleted.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !log.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply project filter
      if (filter !== 'all' && log.projectId !== filter.replace('project-', '')) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Sort by date (most recent first)
      return new Date(b.date) - new Date(a.date)
    })

  if (loading && data.dailyLogs.length === 0) {
    return <LoadingSpinner text="Loading daily logs..." />
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
              placeholder="Search daily logs..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Add Log */}
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field py-2 pl-3 pr-8"
            >
              <option value="all">All Projects</option>
              {data.projects.map(project => (
                <option key={project.id} value={`project-${project.id}`}>
                  {project.name}
                </option>
              ))}
            </select>
            <Link
              to="/app/daily-logs/new"
              className="btn-primary py-2 px-4 flex items-center"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Add Log</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Logs List with Pull to Refresh */}
      <PullToRefresh 
        onRefresh={handleRefresh} 
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="card text-center py-12">
              <SafeIcon icon={FiFileText} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No daily logs found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filter !== 'all'
                  ? 'Try changing your search or filter'
                  : 'Start by creating your first daily log'
                }
              </p>
              <Link to="/app/daily-logs/new" className="btn-primary inline-flex items-center">
                <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                Add Daily Log
              </Link>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-5 h-5 text-primary-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.weather} • Project: {data.projects.find(p => p.id === log.projectId)?.name || 'Unknown Project'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.submittedBy}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Work Completed
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {log.workCompleted}
                  </p>
                </div>

                {log.materials && log.materials.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Materials
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {log.materials.map((material, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs mr-2 mb-2"
                        >
                          {material.item}: {material.quantity} {material.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/app/projects/${log.projectId}`}
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}

export default DailyLogsScreen