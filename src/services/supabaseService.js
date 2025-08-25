import { supabase } from '../lib/supabase'

// Base service class with common functionality
class BaseService {
  constructor(tableName) {
    this.tableName = tableName
  }

  async getAll(userId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async create(item) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// Project service
export class ProjectService extends BaseService {
  constructor() {
    super('projects_ff2024')
  }

  async getProjectsWithStats(userId) {
    const projects = await this.getAll(userId)
    
    // Get task counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const { count: taskCount } = await supabase
          .from('tasks_ff2024')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)

        const { count: completedTasks } = await supabase
          .from('tasks_ff2024')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('status', 'completed')

        return {
          ...project,
          taskCount: taskCount || 0,
          completedTasks: completedTasks || 0,
          progress: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
        }
      })
    )

    return projectsWithStats
  }
}

// Task service
export class TaskService extends BaseService {
  constructor() {
    super('tasks_ff2024')
  }

  async getTasksByProject(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  async getUpcomingTasks(userId, limit = 10) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        projects_ff2024!inner(name, user_id)
      `)
      .eq('projects_ff2024.user_id', userId)
      .neq('status', 'completed')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Daily Log service
export class DailyLogService extends BaseService {
  constructor() {
    super('daily_logs_ff2024')
  }

  async getLogsByProject(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getRecentLogs(userId, limit = 5) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        projects_ff2024!inner(name, user_id)
      `)
      .eq('projects_ff2024.user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Time Entry service
export class TimeEntryService extends BaseService {
  constructor() {
    super('time_entries_ff2024')
  }

  async getEntriesByProject(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getTotalHoursByProject(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('total_hours')
      .eq('project_id', projectId)

    if (error) throw error
    
    return (data || []).reduce((total, entry) => total + (entry.total_hours || 0), 0)
  }
}

// Document service
export class DocumentService extends BaseService {
  constructor() {
    super('documents_ff2024')
  }

  async getDocumentsByProject(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async uploadFile(file, filePath) {
    const { data, error } = await supabase.storage
      .from('fieldflow-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return data
  }

  async getPublicUrl(filePath) {
    const { data } = supabase.storage
      .from('fieldflow-documents')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}

// Service instances
export const projectService = new ProjectService()
export const taskService = new TaskService()
export const dailyLogService = new DailyLogService()
export const timeEntryService = new TimeEntryService()
export const documentService = new DocumentService()

// Combined service for easier imports
export const services = {
  projects: projectService,
  tasks: taskService,
  dailyLogs: dailyLogService,
  timeEntries: timeEntryService,
  documents: documentService
}