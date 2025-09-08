import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiMapPin } = FiIcons

const ScheduleScreen = () => {
  const { user } = useAuthStore()
  const { data, loading, loadAllData } = useDataStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Load data on component mount
  useEffect(() => {
    if (user?.id && data.tasks.length === 0) {
      loadAllData(user.id)
    }
  }, [user?.id, data.tasks.length, loadAllData])

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Week starts on Monday

  // Create array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  // Get tasks scheduled for this week
  const tasksThisWeek = data.tasks.filter(task => {
    const taskDate = new Date(task.dueDate)
    return weekDates.some(date => isSameDay(date, taskDate))
  })

  const getTasksForDate = (date) => {
    return tasksThisWeek.filter(task => isSameDay(new Date(task.dueDate), date))
  }

  const previousWeek = () => {
    setCurrentDate(addDays(startDate, -7))
  }

  const nextWeek = () => {
    setCurrentDate(addDays(startDate, 7))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading && data.tasks.length === 0) {
    return <LoadingSpinner text="Loading schedule..." />
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Schedule
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(startDate, 'MMMM d')} - {format(addDays(startDate, 6), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousWeek}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiChevronLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDates.map((date, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
              {format(date, 'EEE')}
            </p>
            <p className={`text-sm font-semibold ${
              isSameDay(date, new Date())
                ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {format(date, 'd')}
            </p>
          </div>
        ))}

        {/* Calendar Grid */}
        {weekDates.map((date, dateIndex) => (
          <div
            key={`grid-${dateIndex}`}
            className={`min-h-[200px] border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${
              isSameDay(date, new Date())
                ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            {getTasksForDate(date).length > 0 ? (
              <div className="space-y-2">
                {getTasksForDate(date).map(task => {
                  const project = data.projects.find(p => p.id === task.projectId)
                  return (
                    <Link
                      key={task.id}
                      to={`/app/tasks/${task.id}`}
                      className={`block p-2 rounded-lg text-xs ${
                        task.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20'
                          : task.priority === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20'
                          : 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {task.title}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-2">
                        <div className="flex items-center">
                          <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                          {task.estimatedHours}h
                        </div>
                        {project && (
                          <div className="truncate flex-1">
                            <SafeIcon icon={FiMapPin} className="w-3 h-3 mr-1 inline" />
                            {project.name}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                No tasks
              </div>
            )}
          </div>
        ))}
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
            View All
          </Link>
        </div>
        
        {data.tasks
          .filter(task => task.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5)
          .map(task => {
            const project = data.projects.find(p => p.id === task.projectId)
            return (
              <Link
                key={task.id}
                to={`/app/tasks/${task.id}`}
                className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {project?.name || 'Unknown Project'} • Assigned to {task.assignee}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              </Link>
            )
          })}
      </div>
    </div>
  )
}

export default ScheduleScreen