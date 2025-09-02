import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { teamService } from '../../services/teamService'
import { useAppStore } from '../../stores/appStore'
import PullToRefresh from '../../components/common/PullToRefresh'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const { FiSearch, FiPlus, FiUsers, FiMail, FiUserCheck, FiUserX, FiEdit2, FiTrash2, FiShield } = FiIcons

const TeamScreen = () => {
  const { user } = useAuthStore()
  const addNotification = useAppStore(state => state.addNotification)
  
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'user'
  })
  const [inviteLoading, setInviteLoading] = useState(false)

  // Only admins can access team management
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card text-center py-12">
          <SafeIcon icon={FiShield} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Admin Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only company administrators can manage team members.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user?.company_id) {
      loadTeamMembers()
    }
  }, [user?.company_id])

  const loadTeamMembers = async (force = false) => {
    try {
      if (!force) setLoading(true)
      
      const members = await teamService.getTeamMembers(user.company_id)
      setTeamMembers(members)
    } catch (error) {
      console.error('Error loading team members:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Load Team',
        message: error.message
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await loadTeamMembers(true)
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    setInviteLoading(true)

    try {
      await teamService.inviteTeamMember({
        ...inviteForm,
        company_id: user.company_id,
        invited_by: user.id
      })

      addNotification({
        type: 'success',
        title: 'Invitation Sent',
        message: `Invitation sent to ${inviteForm.email}`
      })

      setInviteForm({ email: '', name: '', role: 'user' })
      setShowInviteModal(false)
      loadTeamMembers(true)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Send Invitation',
        message: error.message
      })
    } finally {
      setInviteLoading(false)
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(memberId, newRole)
      
      addNotification({
        type: 'success',
        title: 'Role Updated',
        message: `Member role updated to ${newRole}`
      })

      loadTeamMembers(true)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Role',
        message: error.message
      })
    }
  }

  const handleDeactivateMember = async () => {
    if (!selectedMember) return

    try {
      await teamService.deactivateMember(selectedMember.id)
      
      addNotification({
        type: 'success',
        title: 'Member Deactivated',
        message: `${selectedMember.name} has been deactivated`
      })

      setShowDeactivateModal(false)
      setSelectedMember(null)
      loadTeamMembers(true)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Deactivate Member',
        message: error.message
      })
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    )
  })

  const activeMembers = filteredMembers.filter(m => m.is_active)
  const inactiveMembers = filteredMembers.filter(m => !m.is_active)

  if (loading) {
    return <LoadingSpinner text="Loading team members..." />
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
              placeholder="Search team members..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Invite Member Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Invite Member</span>
          </button>
        </div>
      </div>

      {/* Team Members List with Pull to Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={loading || refreshing}
        className="min-h-screen"
      >
        <div className="p-4 space-y-6">
          {/* Active Members */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Active Members ({activeMembers.length})
            </h2>
            
            {activeMembers.length === 0 ? (
              <div className="card text-center py-8">
                <SafeIcon icon={FiUsers} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No members found' : 'No team members yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start building your team by inviting your first member'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-primary inline-flex items-center"
                  >
                    <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                    Invite First Member
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {activeMembers.map((member) => (
                  <div key={member.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            {member.name.charAt(0)}
                          </span>
                        </div>

                        {/* Member Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {member.name}
                            </h3>
                            {member.id === user.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                              <a href={`mailto:${member.email}`} className="hover:text-primary-600">
                                {member.email}
                              </a>
                            </div>
                          </div>
                          
                          {member.last_login_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Last active: {new Date(member.last_login_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Role and Actions */}
                      <div className="flex items-center space-x-3">
                        {/* Role Badge */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {member.role === 'admin' ? 'Administrator' : 'Team Member'}
                        </span>

                        {/* Actions - only show for other members */}
                        {member.id !== user.id && (
                          <div className="flex items-center space-x-1">
                            {/* Role Toggle */}
                            <button
                              onClick={() => handleUpdateRole(
                                member.id, 
                                member.role === 'admin' ? 'user' : 'admin'
                              )}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                              title={`Make ${member.role === 'admin' ? 'User' : 'Admin'}`}
                            >
                              <SafeIcon icon={member.role === 'admin' ? FiUserX : FiUserCheck} className="w-4 h-4" />
                            </button>

                            {/* Deactivate */}
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setShowDeactivateModal(true)
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              title="Deactivate Member"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inactive Members */}
          {inactiveMembers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Inactive Members ({inactiveMembers.length})
              </h2>
              
              <div className="space-y-3">
                {inactiveMembers.map((member) => (
                  <div key={member.id} className="card opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-400">
                            {member.name.charAt(0)}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Inactive
                        </span>
                        
                        <button
                          onClick={() => teamService.reactivateMember(member.id).then(() => loadTeamMembers(true))}
                          className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                        >
                          Reactivate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowInviteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleInviteMember}>
                <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/20 sm:mx-0 sm:h-10 sm:w-10">
                      <SafeIcon icon={FiPlus} className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Invite Team Member
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            className="input-field"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="colleague@company.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            className="input-field"
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Smith"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                          </label>
                          <select
                            className="input-field"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                          >
                            <option value="user">Team Member</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    disabled={inviteLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false)
          setSelectedMember(null)
        }}
        onConfirm={handleDeactivateMember}
        title="Deactivate Team Member"
        message={`Are you sure you want to deactivate ${selectedMember?.name}? They will lose access to the system but their data will be preserved.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}

export default TeamScreen