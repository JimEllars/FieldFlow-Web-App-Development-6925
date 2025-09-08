import React, { useState, useEffect } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiPlay, FiPause, FiClock, FiCheckCircle, FiCalendar, FiList, FiMapPin, FiPlus } = FiIcons

const TimeTrackingScreen = () => {
  const { user } = useAuthStore()
  const { data, createTimeEntry, loading: dataLoading, loadAllData } = useDataStore()
  const addNotification = useAppStore(state => state.addNotification)

  // Time tracking state
  const [isTracking, setIsTracking] = useState(false)
  const [activeProject, setActiveProject] = useState('')
  const [trackingStartTime, setTrackingStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [description, setDescription] = useState('')

  // Time entry form state
  const [showManualEntryForm, setShowManualEntryForm] = useState(false)
  const [manualEntry, setManualEntry] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
    breakTime: 0,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load data on component mount
  useEffect(() => {
    if (user?.id && data.timeEntries.length === 0) {
      loadAllData(user.id)
    }
  }, [user?.id, data.timeEntries.length, loadAllData])

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Update elapsed time every second when tracking
  useEffect(() => {
    let interval
    if (isTracking && trackingStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now - trackingStartTime) / 1000)
        setElapsedTime(diff)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, trackingStartTime])

  // Get current geolocation
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Error getting location:', error)
          resolve({
            lat: 40.7128, // Default to NYC coordinates
            lng: -74.0060
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    })
  }

  const startTracking = async () => {
    if (!activeProject) {
      setError('Please select a project before starting time tracking')
      return
    }

    setError('')
    try {
      // Get current position for geofencing
      const position = await getCurrentPosition()
      console.log('Starting tracking at position:', position)

      // Start tracking
      setTrackingStartTime(new Date())
      setIsTracking(true)
      setElapsedTime(0)

      // Show success message
      setSuccess('Time tracking started')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error starting tracking:', error)
      setError('Failed to start time tracking')
    }
  }

  const stopTracking = async () => {
    setLoading(true)
    try {
      // Get current position for geofencing
      const position = await getCurrentPosition()

      const startTime = trackingStartTime
      const endTime = new Date()
      const totalSeconds = Math.floor((endTime - startTime) / 1000)
      const totalHours = parseFloat((totalSeconds / 3600).toFixed(2))

      // Create time entry
      const timeEntry = {
        projectId: activeProject,
        userId: user?.id || 'john-smith',
        date: startTime.toISOString().split('T')[0],
        clockIn: startTime.toTimeString().split(' ')[0],
        clockOut: endTime.toTimeString().split(' ')[0],
        breakTime: 0,
        totalHours,
        description,
        location: position
      }

      await createTimeEntry(timeEntry, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Time Entry Saved',
            message: `${totalHours} hours tracked for ${data.projects.find(p => p.id === activeProject)?.name}`
          })
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Failed to Save',
            message: error.message
          })
        }
      })

      // Reset tracking state
      setIsTracking(false)
      setTrackingStartTime(null)
      setElapsedTime(0)
      setDescription('')

      // Show success message
      setSuccess('Time entry saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error stopping tracking:', error)
      setError('Failed to save time entry')
      addNotification({
        type: 'error',
        title: 'Time Tracking Error',
        message: 'Failed to save time entry'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualEntryChange = (e) => {
    const { name, value } = e.target
    setManualEntry(prev => ({ ...prev, [name]: value }))
  }

  const calculateTotalHours = () => {
    if (!manualEntry.clockIn || !manualEntry.clockOut) return 0

    const [inHours, inMinutes] = manualEntry.clockIn.split(':').map(Number)
    const [outHours, outMinutes] = manualEntry.clockOut.split(':').map(Number)

    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes) - manualEntry.breakTime
    return parseFloat((totalMinutes / 60).toFixed(2))
  }

  const submitManualEntry = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!manualEntry.projectId) {
        setError('Please select a project')
        return
      }

      if (!manualEntry.clockIn || !manualEntry.clockOut) {
        setError('Please enter clock in and clock out times')
        return
      }

      const totalHours = calculateTotalHours()
      if (totalHours <= 0) {
        setError('Clock out time must be after clock in time')
        return
      }

      // Get current position for geofencing
      const position = await getCurrentPosition()

      // Create time entry
      const timeEntry = {
        ...manualEntry,
        totalHours,
        location: position,
        userId: user?.id || 'john-smith'
      }

      await createTimeEntry(timeEntry, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Time Entry Saved',
            message: `${totalHours} hours logged for ${data.projects.find(p => p.id === manualEntry.projectId)?.name}`
          })
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Failed to Save',
            message: error.message
          })
        }
      })

      // Reset form
      setManualEntry({
        projectId: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '',
        clockOut: '',
        breakTime: 0,
        description: ''
      })
      setShowManualEntryForm(false)

      // Show success message
      setSuccess('Time entry saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error creating manual time entry:', error)
      setError('Failed to save time entry')
    } finally {
      setLoading(false)
    }
  }

  // Get recent time entries
  const recentTimeEntries = [...data.timeEntries]
    .sort((a, b) => new Date(b.date + 'T' + b.clockIn) - new Date(a.date + 'T' + a.clockIn))
    .slice(0, 5)

  if (dataLoading && data.timeEntries.length === 0) {
    return <LoadingSpinner text="Loading time tracking..." />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Time Tracking
        </h1>
        <button
          onClick={() => setShowManualEntryForm(!showManualEntryForm)}
          className="btn-secondary py-2 px-3 text-sm flex items-center"
        >
          <SafeIcon icon={showManualEntryForm ? FiClock : FiPlus} className="w-4 h-4 mr-1" />
          {showManualEntryForm ? 'Live Tracking' : 'Manual Entry'}
        </button>
      </div>

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

      {showManualEntryForm ? (
        /* Manual Time Entry Form */
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Add Manual Time Entry
          </h2>
          <form onSubmit={submitManualEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Selection */}
              <div>
                <label htmlFor="manual-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project *
                </label>
                <select
                  id="manual-project"
                  name="projectId"
                  value={manualEntry.projectId}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a project</option>
                  {data.projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="manual-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  id="manual-date"
                  name="date"
                  type="date"
                  value={manualEntry.date}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Clock In */}
              <div>
                <label htmlFor="manual-clockIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clock In *
                </label>
                <input
                  id="manual-clockIn"
                  name="clockIn"
                  type="time"
                  value={manualEntry.clockIn}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Clock Out */}
              <div>
                <label htmlFor="manual-clockOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clock Out *
                </label>
                <input
                  id="manual-clockOut"
                  name="clockOut"
                  type="time"
                  value={manualEntry.clockOut}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Break Time */}
              <div>
                <label htmlFor="manual-breakTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Break Time (minutes)
                </label>
                <input
                  id="manual-breakTime"
                  name="breakTime"
                  type="number"
                  value={manualEntry.breakTime}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  min="0"
                  step="1"
                />
              </div>

              {/* Total Hours (calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Hours
                </label>
                <div className="input-field bg-gray-50 dark:bg-gray-800 flex items-center">
                  <span>{calculateTotalHours()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="manual-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="manual-description"
                name="description"
                value={manualEntry.description}
                onChange={handleManualEntryChange}
                className="input-field min-h-[80px]"
                placeholder="Describe the work performed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2 px-6 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mr-2" />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Live Time Tracking */
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Live Time Tracking
          </h2>
          <div className="space-y-6">
            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isTracking ? 'Time tracking in progress' : 'Ready to start tracking'}
              </p>
            </div>

            {/* Project Selection */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select
                id="project"
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="input-field"
                disabled={isTracking}
                required
              >
                <option value="">Select a project</option>
                {data.projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Describe the work you're performing"
                disabled={isTracking && loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {isTracking ? (
                <button
                  onClick={stopTracking}
                  disabled={loading}
                  className="btn-primary bg-red-600 hover:bg-red-700 py-3 px-8 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Stopping...
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiPause} className="w-5 h-5 mr-2" />
                      Stop & Save
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={startTracking}
                  disabled={!activeProject}
                  className="btn-primary py-3 px-8 flex items-center"
                >
                  <SafeIcon icon={FiPlay} className="w-5 h-5 mr-2" />
                  Start Tracking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Time Entries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Recent Time Entries
          </h2>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
            View All
          </a>
        </div>

        {recentTimeEntries.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No time entries recorded yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentTimeEntries.map((entry) => {
              const project = data.projects.find(p => p.id === entry.projectId)
              return (
                <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 text-primary-600 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {entry.totalHours} hours
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                          {format(new Date(entry.date), 'MMM d, yyyy')} • {entry.clockIn.substring(0, 5)} - {entry.clockOut.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <SafeIcon icon={FiList} className="w-3 h-3 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {project ? project.name : 'Unknown Project'}
                        </span>
                      </div>
                      {entry.location && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <SafeIcon icon={FiMapPin} className="w-3 h-3 mr-1" />
                          <span>Geofenced</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {entry.description && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {entry.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeTrackingScreen