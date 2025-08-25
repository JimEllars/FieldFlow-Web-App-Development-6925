import { supabase } from '../lib/supabase'

// Base service class with common functionality and enhanced error handling
class BaseService {
  constructor(tableName) {
    this.tableName = tableName
  }

  // Enhanced error handling with specific error types
  handleError(error, operation = 'operation') {
    console.error(`${operation} failed for ${this.tableName}:`, error)
    
    if (error.message?.includes('network')) {
      throw new Error(`Network error during ${operation}. Please check your connection.`)
    } else if (error.message?.includes('unauthorized') || error.code === 'PGRST301') {
      throw new Error(`Authentication required for ${operation}. Please log in again.`)
    } else if (error.message?.includes('conflict') || error.code === 'PGRST116') {
      throw new Error(`Data conflict during ${operation}. Please refresh and try again.`)
    } else if (error.code === 'PGRST204') {
      throw new Error(`No data found for ${operation}.`)
    } else {
      throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`)
    }
  }

  async getAll(userId, options = {}) {
    try {
      const { orderBy = 'created_at', ascending = false, limit, filters = {} } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order(orderBy, { ascending })

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch all')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch all')
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) this.handleError(error, 'fetch by ID')
      return data
    } catch (error) {
      this.handleError(error, 'fetch by ID')
    }
  }

  async create(item) {
    try {
      const itemWithTimestamp = {
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(itemWithTimestamp)
        .select()
        .single()

      if (error) this.handleError(error, 'create')
      return data
    } catch (error) {
      this.handleError(error, 'create')
    }
  }

  async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) this.handleError(error, 'update')
      return data
    } catch (error) {
      this.handleError(error, 'update')
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) this.handleError(error, 'delete')
      return true
    } catch (error) {
      this.handleError(error, 'delete')
    }
  }

  // Batch operations for better performance
  async createMany(items) {
    try {
      const itemsWithTimestamps = items.map(item => ({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(itemsWithTimestamps)
        .select()

      if (error) this.handleError(error, 'batch create')
      return data || []
    } catch (error) {
      this.handleError(error, 'batch create')
    }
  }

  async updateMany(updates) {
    try {
      const results = []
      
      // Process updates in batches of 10 for better performance
      const batchSize = 10
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        const batchPromises = batch.map(({ id, data }) => 
          this.update(id, data)
        )
        
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }
      
      return results
    } catch (error) {
      this.handleError(error, 'batch update')
    }
  }
}

// Enhanced Project Service
export class ProjectService extends BaseService {
  constructor() {
    super('projects_ff2024')
  }

  async getProjectsWithStats(userId) {
    try {
      const projects = await this.getAll(userId)
      
      // Get task counts for each project in a single query
      const projectIds = projects.map(p => p.id)
      if (projectIds.length === 0) return []

      const { data: taskStats, error: taskError } = await supabase
        .from('tasks_ff2024')
        .select('project_id, status')
        .in('project_id', projectIds)

      if (taskError) this.handleError(taskError, 'fetch task statistics')

      // Calculate stats for each project
      const projectsWithStats = projects.map(project => {
        const projectTasks = (taskStats || []).filter(t => t.project_id === project.id)
        const taskCount = projectTasks.length
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length
        
        return {
          ...project,
          taskCount,
          completedTasks,
          progress: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
        }
      })

      return projectsWithStats
    } catch (error) {
      this.handleError(error, 'fetch projects with statistics')
    }
  }

  async getProjectsByStatus(userId, status) {
    return this.getAll(userId, { filters: { status } })
  }

  async getRecentProjects(userId, limit = 5) {
    return this.getAll(userId, { 
      orderBy: 'updated_at', 
      ascending: false, 
      limit 
    })
  }

  async searchProjects(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false })

      if (error) this.handleError(error, 'search projects')
      return data || []
    } catch (error) {
      this.handleError(error, 'search projects')
    }
  }
}

// Enhanced Task Service
export class TaskService extends BaseService {
  constructor() {
    super('tasks_ff2024')
  }

  async getTasksByProject(projectId, options = {}) {
    try {
      const { status, priority, assignee, orderBy = 'due_date' } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('project_id', projectId)
        .order(orderBy, { ascending: true })

      if (status) query = query.eq('status', status)
      if (priority) query = query.eq('priority', priority)
      if (assignee) query = query.eq('assignee', assignee)

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch tasks by project')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch tasks by project')
    }
  }

  async getUpcomingTasks(userId, options = {}) {
    try {
      const { limit = 10, daysAhead = 7 } = options
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(name, user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .neq('status', 'completed')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(limit)

      if (error) this.handleError(error, 'fetch upcoming tasks')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch upcoming tasks')
    }
  }

  async getOverdueTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(name, user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .neq('status', 'completed')
        .lt('due_date', today)
        .order('due_date', { ascending: true })

      if (error) this.handleError(error, 'fetch overdue tasks')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch overdue tasks')
    }
  }

  async updateTaskStatus(taskId, status) {
    const updateData = { status }
    
    // Add completion timestamp if marking as completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    return this.update(taskId, updateData)
  }

  async getTasksByAssignee(userId, assignee) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(name, user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .eq('assignee', assignee)
        .neq('status', 'completed')
        .order('due_date', { ascending: true })

      if (error) this.handleError(error, 'fetch tasks by assignee')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch tasks by assignee')
    }
  }
}

// Enhanced Daily Log Service
export class DailyLogService extends BaseService {
  constructor() {
    super('daily_logs_ff2024')
  }

  async getLogsByProject(projectId, options = {}) {
    try {
      const { limit, startDate, endDate } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })

      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)
      if (limit) query = query.limit(limit)

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch logs by project')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch logs by project')
    }
  }

  async getRecentLogs(userId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(name, user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)

      if (error) this.handleError(error, 'fetch recent logs')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch recent logs')
    }
  }

  async getLogsByDateRange(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(name, user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) this.handleError(error, 'fetch logs by date range')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch logs by date range')
    }
  }
}

// Enhanced Time Entry Service
export class TimeEntryService extends BaseService {
  constructor() {
    super('time_entries_ff2024')
  }

  async getEntriesByProject(projectId, options = {}) {
    try {
      const { startDate, endDate, userId } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })

      if (userId) query = query.eq('user_id', userId)
      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch time entries by project')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch time entries by project')
    }
  }

  async getTotalHoursByProject(projectId, options = {}) {
    try {
      const { startDate, endDate, userId } = options
      
      let query = supabase
        .from(this.tableName)
        .select('total_hours')
        .eq('project_id', projectId)

      if (userId) query = query.eq('user_id', userId)
      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)

      const { data, error } = await query

      if (error) this.handleError(error, 'calculate total hours')
      return (data || []).reduce((total, entry) => total + (entry.total_hours || 0), 0)
    } catch (error) {
      this.handleError(error, 'calculate total hours')
    }
  }

  async getTimeEntriesByUser(userId, options = {}) {
    try {
      const { startDate, endDate, projectId, limit } = options
      
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024(name)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (projectId) query = query.eq('project_id', projectId)
      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)
      if (limit) query = query.limit(limit)

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch time entries by user')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch time entries by user')
    }
  }

  async getWeeklyTimeReport(userId, weekStartDate) {
    try {
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekEndDate.getDate() + 6)

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024(name)
        `)
        .eq('user_id', userId)
        .gte('date', weekStartDate.toISOString().split('T')[0])
        .lte('date', weekEndDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) this.handleError(error, 'generate weekly time report')
      return data || []
    } catch (error) {
      this.handleError(error, 'generate weekly time report')
    }
  }
}

// Enhanced Document Service
export class DocumentService extends BaseService {
  constructor() {
    super('documents_ff2024')
  }

  async getDocumentsByProject(projectId, options = {}) {
    try {
      const { category, type, limit } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false })

      if (category) query = query.eq('category', category)
      if (type) query = query.eq('type', type)
      if (limit) query = query.limit(limit)

      const { data, error } = await query

      if (error) this.handleError(error, 'fetch documents by project')
      return data || []
    } catch (error) {
      this.handleError(error, 'fetch documents by project')
    }
  }

  async uploadFile(file, filePath, options = {}) {
    try {
      const { cacheControl = '3600', upsert = false } = options
      
      const { data, error } = await supabase.storage
        .from('fieldflow-documents')
        .upload(filePath, file, {
          cacheControl,
          upsert
        })

      if (error) this.handleError(error, 'upload file')
      return data
    } catch (error) {
      this.handleError(error, 'upload file')
    }
  }

  async getPublicUrl(filePath) {
    try {
      const { data } = supabase.storage
        .from('fieldflow-documents')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      this.handleError(error, 'get public URL')
    }
  }

  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from('fieldflow-documents')
        .remove([filePath])

      if (error) this.handleError(error, 'delete file')
      return true
    } catch (error) {
      this.handleError(error, 'delete file')
    }
  }

  async searchDocuments(userId, searchTerm, options = {}) {
    try {
      const { projectId, category, type } = options
      
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          projects_ff2024!inner(user_id)
        `)
        .eq('projects_ff2024.user_id', userId)
        .ilike('name', `%${searchTerm}%`)
        .order('uploaded_at', { ascending: false })

      if (projectId) query = query.eq('project_id', projectId)
      if (category) query = query.eq('category', category)
      if (type) query = query.eq('type', type)

      const { data, error } = await query

      if (error) this.handleError(error, 'search documents')
      return data || []
    } catch (error) {
      this.handleError(error, 'search documents')
    }
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

// Service health check
export const checkServiceHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('projects_ff2024')
      .select('id')
      .limit(1)

    return {
      healthy: !error,
      error: error?.message,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export default services