import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { clientService } from '../../services/clientService'
import PullToRefresh from '../../components/common/PullToRefresh'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiUsers, FiMail, FiPhone, FiMapPin, FiChevronRight } = FiIcons

const ClientsScreen = () => {
  const { user } = useAuthStore()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Load clients on component mount
  useEffect(() => {
    if (user?.company_id) {
      loadClients()
    }
  }, [user?.company_id])

  const loadClients = async () => {
    if (!user?.company_id) return
    
    try {
      setLoading(true)
      setError('')
      const clientsData = await clientService.getAll(user.company_id)
      setClients(clientsData)
    } catch (err) {
      console.error('Error loading clients:', err)
      setError('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  // Handle pull to refresh
  const handleRefresh = async () => {
    if (!user?.company_id || refreshing) return
    
    setRefreshing(true)
    try {
      await loadClients()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Search clients
  const handleSearch = async (term) => {
    setSearchTerm(term)
    
    if (!term.trim()) {
      loadClients()
      return
    }

    try {
      const searchResults = await clientService.searchClients(user.company_id, term)
      setClients(searchResults)
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed')
    }
  }

  if (loading && clients.length === 0) {
    return <LoadingSpinner text="Loading clients..." />
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
              placeholder="Search clients..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Add Client Button */}
          <Link
            to="/app/clients/new"
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Add Client</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Clients List with Pull to Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-4">
          {clients.length === 0 ? (
            <div className="card text-center py-12">
              <SafeIcon icon={FiUsers} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start building your client relationships by adding your first client'
                }
              </p>
              {!searchTerm && (
                <Link to="/app/clients/new" className="btn-primary inline-flex items-center">
                  <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                  Add Your First Client
                </Link>
              )}
            </div>
          ) : (
            clients.map((client) => (
              <Link
                key={client.id}
                to={`/app/clients/${client.id}`}
                className="card block hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {client.name}
                      </h3>
                      <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="space-y-2">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <SafeIcon icon={FiMail} className="w-4 h-4 mr-2" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}

                      {client.phone_number && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <SafeIcon icon={FiPhone} className="w-4 h-4 mr-2" />
                          <span>{client.phone_number}</span>
                        </div>
                      )}

                      {client.address && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
                        <p className="line-clamp-2">{client.notes}</p>
                      </div>
                    )}
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

export default ClientsScreen