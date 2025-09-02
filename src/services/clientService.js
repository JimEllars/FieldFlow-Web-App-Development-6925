import { supabase } from '../lib/supabase'

export class ClientService {
  constructor() {
    this.tableName = 'clients_ff2024'
  }

  async getAll(companyId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw new Error(`Failed to fetch clients: ${error.message}`)
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching client:', error)
      throw new Error(`Failed to fetch client: ${error.message}`)
    }
  }

  async create(clientData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating client:', error)
      throw new Error(`Failed to create client: ${error.message}`)
    }
  }

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating client:', error)
      throw new Error(`Failed to update client: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting client:', error)
      throw new Error(`Failed to delete client: ${error.message}`)
    }
  }

  async getClientProjects(clientId) {
    try {
      const { data, error } = await supabase
        .from('projects_ff2024')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching client projects:', error)
      throw new Error(`Failed to fetch client projects: ${error.message}`)
    }
  }

  async searchClients(companyId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching clients:', error)
      throw new Error(`Failed to search clients: ${error.message}`)
    }
  }
}

export const clientService = new ClientService()
export default clientService