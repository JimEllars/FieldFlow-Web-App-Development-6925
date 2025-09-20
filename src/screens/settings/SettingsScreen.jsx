import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { 
  FiSun, FiMoon, FiMonitor, FiDatabase, 
  FiDownload, FiUpload, FiTrash2, FiSave
} = FiIcons

const SettingsScreen = () => {
  const { theme, setLightTheme, setDarkTheme } = useTheme()
  
  const [offlineStorage, setOfflineStorage] = useState({
    limitDocuments: true,
    documentStorageLimit: 100, // MB
    clearCacheOnLogout: false
  })
  
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 15, // minutes
    syncOnWifiOnly: false
  })
  
  const [success, setSuccess] = useState('')
  
  const handleOfflineStorageChange = (e) => {
    const { name, value, type, checked } = e.target
    setOfflineStorage(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSyncSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setSyncSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSaveSettings = () => {
    // Save settings logic would go here
    setSuccess('Settings saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }
  
  const handleClearCache = () => {
    // Clear cache logic would go here
    setSuccess('Cache cleared successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Settings
      </h1>
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}
      
      {/* Appearance */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={setLightTheme}
            className={`p-4 rounded-lg border ${
              theme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            } flex flex-col items-center justify-center`}
          >
            <SafeIcon 
              icon={FiSun} 
              className={`w-8 h-8 mb-2 ${
                theme === 'light'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} 
            />
            <span className={theme === 'light' ? 'font-medium text-primary-700 dark:text-primary-400' : ''}>
              Light Mode
            </span>
          </button>
          
          <button
            onClick={setDarkTheme}
            className={`p-4 rounded-lg border ${
              theme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            } flex flex-col items-center justify-center`}
          >
            <SafeIcon 
              icon={FiMoon} 
              className={`w-8 h-8 mb-2 ${
                theme === 'dark'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} 
            />
            <span className={theme === 'dark' ? 'font-medium text-primary-700 dark:text-primary-400' : ''}>
              Dark Mode
            </span>
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('foremanos-theme')
              window.location.reload()
            }}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
          >
            <SafeIcon icon={FiMonitor} className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
            <span>System Default</span>
          </button>
        </div>
      </div>
      
      {/* Offline Storage */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Offline Storage
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Limit Document Storage
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set a limit for offline document storage
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="limitDocuments"
                checked={offlineStorage.limitDocuments} 
                onChange={handleOfflineStorageChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {offlineStorage.limitDocuments && (
            <div>
              <label htmlFor="documentStorageLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Limit (MB)
              </label>
              <input
                id="documentStorageLimit"
                name="documentStorageLimit"
                type="number"
                value={offlineStorage.documentStorageLimit}
                onChange={handleOfflineStorageChange}
                className="input-field max-w-xs"
                min="10"
                step="10"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Clear Cache on Logout
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically clear cached data when signing out
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="clearCacheOnLogout"
                checked={offlineStorage.clearCacheOnLogout} 
                onChange={handleOfflineStorageChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClearCache}
              className="btn-secondary py-2 px-4 flex items-center"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
              Clear Cache
            </button>
          </div>
        </div>
      </div>
      
      {/* Synchronization */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Synchronization
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Synchronization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically sync data when online
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="autoSync"
                checked={syncSettings.autoSync} 
                onChange={handleSyncSettingsChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {syncSettings.autoSync && (
            <>
              <div>
                <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sync Interval (minutes)
                </label>
                <input
                  id="syncInterval"
                  name="syncInterval"
                  type="number"
                  value={syncSettings.syncInterval}
                  onChange={handleSyncSettingsChange}
                  className="input-field max-w-xs"
                  min="5"
                  step="5"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sync on Wi-Fi Only
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Save mobile data by syncing only when on Wi-Fi
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="syncOnWifiOnly"
                    checked={syncSettings.syncOnWifiOnly} 
                    onChange={handleSyncSettingsChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Manual Synchronization
            </h3>
            
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary py-2 px-4 flex items-center"
              >
                <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
                Upload All Pending Changes
              </button>
              
              <button
                type="button"
                className="btn-secondary py-2 px-4 flex items-center"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
                Download Latest Data
              </button>
              
              <button
                type="button"
                className="btn-secondary py-2 px-4 flex items-center"
              >
                <SafeIcon icon={FiDatabase} className="w-4 h-4 mr-2" />
                Full Sync
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Settings */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="btn-primary py-2 px-6 flex items-center"
        >
          <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default SettingsScreen