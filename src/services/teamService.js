import { supabase } from '../lib/supabase'

export class TeamService {
  constructor() {
    this.tableName = 'profiles_ff2024'
  }

  async getTeamMembers(companyId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching team members:', error)
      throw new Error(`Failed to fetch team members: ${error.message}`)
    }
  }

  async inviteTeamMember(inviteData) {
    try {
      // In a real app, this would send an email invitation
      // For now, we'll create a placeholder user that needs to be activated
      const { data, error } = await supabase
        .from('team_invitations_ff2024')
        .insert({
          company_id: inviteData.company_id,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          invited_by: inviteData.invited_by,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error inviting team member:', error)
      throw new Error(`Failed to send invitation: ${error.message}`)
    }
  }

  async updateMemberRole(memberId, newRole) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating member role:', error)
      throw new Error(`Failed to update member role: ${error.message}`)
    }
  }

  async deactivateMember(memberId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deactivating member:', error)
      throw new Error(`Failed to deactivate member: ${error.message}`)
    }
  }

  async reactivateMember(memberId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error reactivating member:', error)
      throw new Error(`Failed to reactivate member: ${error.message}`)
    }
  }

  async getTeamInvitations(companyId) {
    try {
      const { data, error } = await supabase
        .from('team_invitations_ff2024')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching team invitations:', error)
      throw new Error(`Failed to fetch invitations: ${error.message}`)
    }
  }

  async cancelInvitation(invitationId) {
    try {
      const { data, error } = await supabase
        .from('team_invitations_ff2024')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      throw new Error(`Failed to cancel invitation: ${error.message}`)
    }
  }
}

export const teamService = new TeamService()
export default teamService