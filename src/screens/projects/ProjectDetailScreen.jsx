import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { 
  FiArrowLeft, FiCalendar, FiDollarSign, FiMapPin, FiUsers, 
  FiFileText, FiCheckSquare, FiClock, FiEdit2, FiTrash2
} = FiIcons

const ProjectDetailScreen = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { 
    getProjectById, 
    getTasksByProject, 
    getDailyLogsByProject,
    getTimeEntriesByProject,
    getDocumentsByProject,
    deleteProject
  } = useData()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const project = getProjectById(projectId)
  const tasks = getTasksByProject(projectId)
  const dailyLogs = getDailyLogsByProject(projectId)
  const timeEntries = getTimeEntriesByProject(projectId)
  const documents = getDocumentsByProject(projectId)
  
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Project not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/app/projects"
            className="btn-primary"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }
  
  const handleDeleteProject = () => {
    deleteProject(projectId)
    navigate('/app/projects')
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Project Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {project.client}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : project.status === 'planning'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1 text-gray-500" />
                    {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1 text-gray-500" />
                    ${project.budget.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1 text-gray-500" />
                    {project.address}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Team</p>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <SafeIcon icon={FiUsers} className="w-4 h-4 mr-1 text-gray-500" />
                    {project.team.join(', ')}
                  </div>
                </div>
              </div>
              
              {project.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Overall Completion
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Budget Utilization
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {Math.round((project.spent / project.budget) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      (project.spent / project.budget) > 0.9 
                        ? 'bg-red-600' 
                        : (project.spent / project.budget) > 0.7 
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>${project.spent.toLocaleString()} spent</span>
                  <span>${project.budget.toLocaleString()} budget</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Tasks
                  </h3>
                  <Link to="/app/tasks" className="text-xs text-primary-600">
                    View all
                  </Link>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tasks.length}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {tasks.filter(t => t.status === 'completed').length} completed
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Daily Logs
                  </h3>
                  <Link to="/app/daily-logs" className="text-xs text-primary-600">
                    View all
                  </Link>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {dailyLogs.length}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Last entry: {dailyLogs.length > 0 ? format(new Date(dailyLogs[0].date), 'MMM d, yyyy') : 'None'}
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Time Entries
                  </h3>
                  <Link to="/app/time-tracking" className="text-xs text-primary-600">
                    View all
                  </Link>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {timeEntries.length}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {timeEntries.reduce((total, entry) => total + entry.totalHours, 0)} hours tracked
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Tasks
              </h3>
              
              <Link
                to={`/app/tasks/new?projectId=${projectId}`}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                Add Task
              </Link>
            </div>
            
            {tasks.length === 0 ? (
              <div className="card text-center py-8">
                <SafeIcon icon={FiCheckSquare} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No tasks yet
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add tasks to track work on this project
                </p>
                <Link
                  to={`/app/tasks/new?projectId=${projectId}`}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                  Add First Task
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/app/tasks/${task.id}`}
                    className="card block p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </h4>
                        
                        <div className="flex items-center mt-2 text-sm">
                          <div className="mr-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                          
                          <div className="mr-4 text-gray-600 dark:text-gray-400">
                            <SafeIcon icon={FiCalendar} className="w-3 h-3 inline mr-1" />
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                          
                          <div className="text-gray-600 dark:text-gray-400">
                            Assigned to: {task.assignee}
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
        
      case 'logs':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Daily Logs
              </h3>
              
              <Link
                to={`/app/daily-logs/new?projectId=${projectId}`}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                Add Log
              </Link>
            </div>
            
            {dailyLogs.length === 0 ? (
              <div className="card text-center py-8">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No daily logs yet
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add daily logs to track progress and activities
                </p>
                <Link
                  to={`/app/daily-logs/new?projectId=${projectId}`}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                  Add First Log
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyLogs.map((log) => (
                  <div key={log.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.weather} • Submitted by {log.submittedBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Work Completed
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.workCompleted}
                      </p>
                    </div>
                    
                    {log.notes && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Notes
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.notes}
                        </p>
                      </div>
                    )}
                    
                    {log.materials && log.materials.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Materials
                        </h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {log.materials.map((material, index) => (
                            <li key={index}>
                              {material.item}: {material.quantity} {material.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {log.equipment && log.equipment.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Equipment
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.equipment.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {log.crew && log.crew.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Crew
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.crew.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
        
      case 'time':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Time Tracking
              </h3>
              
              <Link
                to={`/app/time-tracking?projectId=${projectId}`}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                Add Time
              </Link>
            </div>
            
            {timeEntries.length === 0 ? (
              <div className="card text-center py-8">
                <SafeIcon icon={FiClock} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No time entries yet
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Track working hours on this project
                </p>
                <Link
                  to={`/app/time-tracking?projectId=${projectId}`}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                  Add First Entry
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.clockIn.substring(0, 5)} - {entry.clockOut.substring(0, 5)} • {entry.totalHours} hours
                        </p>
                      </div>
                      <div>
                        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {entry.totalHours} hrs
                        </span>
                      </div>
                    </div>
                    
                    {entry.description && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {entry.description}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="card p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Total Hours
                    </span>
                    <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {timeEntries.reduce((total, entry) => total + entry.totalHours, 0)} hrs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      case 'documents':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Documents
              </h3>
              
              <Link
                to={`/app/documents/upload?projectId=${projectId}`}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                Upload
              </Link>
            </div>
            
            {documents.length === 0 ? (
              <div className="card text-center py-8">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No documents yet
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload plans, permits, and other project documents
                </p>
                <Link
                  to={`/app/documents/upload?projectId=${projectId}`}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
                  Upload First Document
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/app/documents/${doc.id}`}
                    className="card block p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {doc.name}
                        </h4>
                        
                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="mr-4">
                            {doc.type.toUpperCase()} • {doc.size}
                          </div>
                          <div>
                            Uploaded: {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {doc.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/projects"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {project.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {project.client}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/app/projects/${projectId}/edit`}
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
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {['overview', 'tasks', 'logs', 'time', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
      
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
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this project? All data including tasks, 
                        daily logs, and documents will be permanently removed. This action 
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteProject}
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

export default ProjectDetailScreen