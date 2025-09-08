import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import PullToRefresh from '../../components/common/PullToRefresh'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiFilter, FiCalendar, FiCheckSquare } = FiIcons

const TasksScreen = () => {
  const { user } = useAuthStore()
  const { data, loading, loadAllData, pullToRefresh } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, in-progress, completed
  const [refreshing, setRefreshing] = useState(false)

  // Load data on component mount
  useEffect(() => {
    if (user?.id && data.tasks.length === 0) {
      loadAllData(user.id)
    }
  }, [user?.id, data.tasks.length, loadAllData])

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

  const filteredTasks = data.tasks
    .filter(task => {
      // Apply search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Apply status filter
      if (filter !== 'all' && task.status !== filter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by priority (high first), then by due date
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

  if (loading && data.tasks.length === 0) {
    return <LoadingSpinner text="Loading tasks..." />
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
              placeholder="Search tasks..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Add Task */}
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field py-2 pl-3 pr-8"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Link
              to="/app/tasks/new"
              className="btn-primary py-2 px-4 flex items-center"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Add Task</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tasks List with Pull to Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="card text-center py-12">
              <SafeIcon icon={FiCheckSquare} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try changing your search or filter' 
                  : 'Start by creating your first task'
                }
              </p>
              <Link
                to="/app/tasks/new"
                className="btn-primary inline-flex items-center"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                Add Task
              </Link>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Link
                key={task.id}
                to={`/app/tasks/${task.id}`}
                className="card block hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                        Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Assigned to: {task.assignee}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {task.estimatedHours} hours estimated
                      </div>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                {/* Project association */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Project: </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                      {data.projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}

export default TasksScreen