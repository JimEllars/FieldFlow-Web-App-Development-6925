import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { clientService } from '../../services/clientService'
import { useAppStore } from '../../stores/appStore'
import PullToRefresh from '../../components/common/PullToRefresh'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiUsers, FiMail, FiPhone, FiMapPin, FiChevronRight } = FiIcons

const ClientsScreen = () => {
  const { user } = useAuthStore()
  const addNotification = useAppStore(state => state.addNotification)
  
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Load clients on component mount
  useEffect(() => {
    if (user?.company_id) {
      loadClients()
    }
  }, [user?.company_id])

  const loadClients = async (force = false) => {
    try {
      if (!force) setLoading(true)
      
      // In test mode, use mock data
      if (user?.company_id && import.meta.env.VITE_TEST_MODE === 'true') {
        // Mock clients data
        const mockClients = [
          {
            id: 'client-1',
            name: 'Johnson Family',
            email: 'sarah.johnson@email.com',
            phone_number: '(555) 123-4567',
            address: '123 Oak Street, Springfield, IL 62701',
            notes: 'Preferred client - always pays on time. Interested in future landscaping projects.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'client-2',
            name: 'Springfield Business Park',
            email: 'maintenance@springfieldpark.com',
            phone_number: '(555) 987-6543',
            address: '456 Business Drive, Springfield, IL 62702',
            notes: 'Commercial client - requires all work to be completed after business hours.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'client-3',
            name: 'Smith Residence',
            email: 'mike.smith@email.com',
            phone_number: '(555) 555-0123',
            address: '789 Maple Ave, Springfield, IL 62703',
            notes: 'New client - referred by Johnson Family. Very detail-oriented.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setClients(mockClients)
      } else {
        // Production mode - fetch from Supabase
        const clientsData = await clientService.getAll(user.company_id)
        setClients(clientsData)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Load Clients',
        message: error.message
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle pull to refresh
  const handleRefresh = async () => {
    if (!user?.company_id || refreshing) return
    setRefreshing(true)
    await loadClients(true)
  }

  // Search clients
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone_number?.includes(searchTerm)
    )
  })

  if (loading) {
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
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Clients List with Pull to Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-4">
          {filteredClients.length === 0 ? (
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
                <Link
                  to="/app/clients/new"
                  className="btn-primary inline-flex items-center"
                >
                  <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                  Add Your First Client
                </Link>
              )}
            </div>
          ) : (
            filteredClients.map((client) => (
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