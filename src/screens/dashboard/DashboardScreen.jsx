import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { useOffline } from '../../contexts/OfflineContext'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { 
  FiFolder, FiCheckSquare, FiClock, FiFileText, 
  FiTrendingUp, FiUsers, FiCalendar, FiPlus 
} = FiIcons

const DashboardScreen = () => {
  const { user } = useAuth()
  const { data } = useData()
  const { isOnline, pendingChanges } = useOffline()

  const stats = {
    activeProjects: data.projects.filter(p => p.status === 'active').length,
    pendingTasks: data.tasks.filter(t => t.status === 'pending').length,
    totalProjects: data.projects.length,
    completedTasks: data.tasks.filter(t => t.status === 'completed').length
  }

  const recentProjects = data.projects.slice(0, 3)
  const upcomingTasks = data.tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)

  const quickActions = [
    {
      title: 'New Daily Log',
      description: 'Record today\'s progress',
      icon: FiFileText,
      link: '/app/daily-logs/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Clock In',
      description: 'Start time tracking',
      icon: FiClock,
      link: '/app/time-tracking',
      color: 'bg-green-500'
    },
    {
      title: 'View Tasks',
      description: 'Check assignments',
      icon: FiCheckSquare,
      link: '/app/tasks',
      color: 'bg-orange-500'
    },
    {
      title: 'Browse Projects',
      description: 'Manage projects',
      icon: FiFolder,
      link: '/app/projects',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-primary-100">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
        {!isOnline && (
          <div className="mt-3 flex items-center text-primary-100">
            <SafeIcon icon={FiCheckSquare} className="w-4 h-4 mr-2" />
            <span className="text-sm">Working offline - {pendingChanges} changes pending</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.activeProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiFolder} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pendingTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completedTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects & Upcoming Tasks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Projects
            </h2>
            <Link
              to="/app/projects"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/app/projects/${project.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.client}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {project.progress}% complete
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Tasks
            </h2>
            <Link
              to="/app/tasks"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <Link
                key={task.id}
                to={`/app/tasks/${task.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to: {task.assignee}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardScreen