import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { clientService } from '../../services/clientService'
import { useDataStore } from '../../stores/dataStore'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiUser, FiCalendar, FiFolder, FiPlus, FiFileText } = FiIcons

const ClientDetailScreen = () => {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data } = useDataStore()
  
  const [client, setClient] = useState(null)
  const [clientProjects, setClientProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (clientId) {
      loadClientData()
    }
  }, [clientId])

  const loadClientData = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (import.meta.env.VITE_TEST_MODE === 'true') {
        // Mock client data for test mode
        const mockClients = [
          {
            id: 'client-1',
            name: 'Johnson Family',
            email: 'sarah.johnson@email.com',
            phone_number: '(555) 123-4567',
            address: '123 Oak Street, Springfield, IL 62701',
            notes: 'Preferred client - always pays on time. Interested in future landscaping projects.',
            created_at: new Date().toISOString()
          },
          {
            id: 'client-2',
            name: 'Springfield Business Park',
            email: 'maintenance@springfieldpark.com',
            phone_number: '(555) 987-6543',
            address: '456 Business Drive, Springfield, IL 62702',
            notes: 'Commercial client - requires all work to be completed after business hours.',
            created_at: new Date().toISOString()
          },
          {
            id: 'client-3',
            name: 'Smith Residence',
            email: 'mike.smith@email.com',
            phone_number: '(555) 555-0123',
            address: '789 Maple Ave, Springfield, IL 62703',
            notes: 'New client - referred by Johnson Family. Very detail-oriented.',
            created_at: new Date().toISOString()
          }
        ]
        
        const clientData = mockClients.find(c => c.id === clientId)
        setClient(clientData)
        
        // Get projects for this client from the data store
        const projectsForClient = data.projects.filter(p => 
          p.client_id === clientId || p.client === clientData?.name
        )
        setClientProjects(projectsForClient)
      } else {
        // Production mode
        const [clientData, projectsData] = await Promise.all([
          clientService.getById(clientId),
          clientService.getClientProjects(clientId)
        ])
        
        setClient(clientData)
        setClientProjects(projectsData)
      }
    } catch (err) {
      console.error('Error loading client data:', err)
      setError('Failed to load client information')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    try {
      if (import.meta.env.VITE_TEST_MODE === 'true') {
        // In test mode, just navigate back
        navigate('/app/clients')
      } else {
        await clientService.delete(clientId)
        navigate('/app/clients')
      }
    } catch (err) {
      console.error('Error deleting client:', err)
      setError('Failed to delete client')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading client details..." />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Error Loading Client
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/app/clients" className="btn-primary">
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Client Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The client you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/app/clients" className="btn-primary">
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/app/clients"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {client.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Client since {format(new Date(client.created_at), 'MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/app/clients/${clientId}/edit`}
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

      {/* Client Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
              </div>
            </div>
            
            {client.email && (
              <div className="flex items-center">
                <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}

            {client.phone_number && (
              <div className="flex items-center">
                <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <a
                    href={`tel:${client.phone_number}`}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    {client.phone_number}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {client.address && (
              <div className="flex items-start">
                <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{client.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client Since</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(client.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              Notes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {client.notes}
            </p>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Projects ({clientProjects.length})
          </h2>
          <Link
            to={`/app/projects/new?clientId=${clientId}`}
            className="btn-primary py-2 px-3 text-sm flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1" />
            New Project
          </Link>
        </div>

        {clientProjects.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiFolder} className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Start your first project with {client.name}
            </p>
            <Link
              to={`/app/projects/new?clientId=${clientId}`}
              className="btn-primary py-2 px-4 text-sm"
            >
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clientProjects.map((project) => (
              <Link
                key={project.id}
                to={`/app/projects/${project.id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {project.name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : project.status === 'planning'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Budget: ${project.budget?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {project.progress || 0}% complete
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
                      Delete Client
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete {client.name}? This will also affect any projects associated with this client. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteClient}
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

export default ClientDetailScreen