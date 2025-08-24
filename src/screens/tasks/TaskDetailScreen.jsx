import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { 
  FiArrowLeft, FiCalendar, FiClock, FiUser, FiFileText,
  FiEdit2, FiTrash2, FiCheckSquare, FiX, FiCheckCircle
} = FiIcons

const TaskDetailScreen = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { getTaskById, getProjectById, updateTask, deleteTask } = useData()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const task = getTaskById(taskId)
  
  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Task not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/app/tasks"
            className="btn-primary"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    )
  }
  
  const project = getProjectById(task.projectId)
  
  const handleDeleteTask = () => {
    deleteTask(taskId)
    navigate('/app/tasks')
  }
  
  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusActionButton = () => {
    switch (task.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleStatusChange('in-progress')}
            disabled={loading}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiCheckSquare} className="w-4 h-4 mr-2" />
            Start Task
          </button>
        )
      case 'in-progress':
        return (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={loading}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mr-2" />
            Complete Task
          </button>
        )
      case 'completed':
        return (
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={loading}
            className="btn-secondary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
            Reopen Task
          </button>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/tasks"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {task.title}
            </h1>
            <Link
              to={`/app/projects/${project.id}`}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              {project.name}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/app/tasks/${taskId}/edit`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <SafeIcon icon={FiEdit2} className="w-5 h-5" />
          </Link>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <SafeIcon icon={FiTrash2} className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          task.status === 'completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : task.status === 'in-progress'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          task.priority === 'high'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : task.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      
      {/* Task Details */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{task.assignee}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated hours</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{task.estimatedHours} hours</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <SafeIcon icon={FiFileText} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
        
        {task.description && (
          <div className="mt-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {task.description}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center">
        {getStatusActionButton()}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <SafeIcon icon={FiTrash2} className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Delete Task
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this task? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteTask}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetailScreen