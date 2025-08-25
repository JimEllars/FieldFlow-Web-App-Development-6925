/**
 * @fileoverview Type definitions for FieldFlow application
 * These JSDoc type definitions help with IDE autocompletion and documentation
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique project identifier
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} client - Client name
 * @property {'planning'|'active'|'on-hold'|'completed'} status - Project status
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} startDate - Start date (ISO string)
 * @property {string} endDate - End date (ISO string)
 * @property {number} budget - Project budget
 * @property {number} spent - Amount spent
 * @property {string} address - Project address
 * @property {string[]} team - Team member names
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {string} updatedAt - Last update timestamp (ISO string)
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} projectId - Associated project ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {'pending'|'in-progress'|'completed'} status - Task status
 * @property {'low'|'medium'|'high'} priority - Task priority
 * @property {string} assignee - Assigned person name
 * @property {string} dueDate - Due date (ISO string)
 * @property {number} estimatedHours - Estimated hours to complete
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {string} updatedAt - Last update timestamp (ISO string)
 */

/**
 * @typedef {Object} DailyLog
 * @property {string} id - Unique log identifier
 * @property {string} projectId - Associated project ID
 * @property {string} date - Log date (ISO string)
 * @property {string} weather - Weather conditions
 * @property {string} workCompleted - Description of work completed
 * @property {string} notes - Additional notes
 * @property {string[]} crew - Crew member names
 * @property {Material[]} materials - Materials used
 * @property {string[]} equipment - Equipment used
 * @property {Photo[]} photos - Associated photos
 * @property {string} submittedBy - Person who submitted the log
 * @property {string} submittedAt - Submission timestamp (ISO string)
 * @property {string} createdAt - Creation timestamp (ISO string)
 */

/**
 * @typedef {Object} Material
 * @property {string} item - Material name
 * @property {string} quantity - Quantity used
 * @property {string} unit - Unit of measurement
 */

/**
 * @typedef {Object} Photo
 * @property {string} id - Unique photo identifier
 * @property {string} name - Photo name
 * @property {string} url - Photo URL
 * @property {string} uploadedBy - Person who uploaded
 * @property {string} uploadedAt - Upload timestamp (ISO string)
 * @property {boolean} compressed - Whether photo was compressed
 * @property {string} compressionRatio - Compression ratio percentage
 */

/**
 * @typedef {Object} TimeEntry
 * @property {string} id - Unique time entry identifier
 * @property {string} projectId - Associated project ID
 * @property {string} userId - User ID
 * @property {string} date - Entry date (ISO string)
 * @property {string} clockIn - Clock in time (HH:MM:SS)
 * @property {string} clockOut - Clock out time (HH:MM:SS)
 * @property {number} breakTime - Break time in minutes
 * @property {number} totalHours - Total hours worked
 * @property {string} description - Work description
 * @property {Location} location - GPS location
 * @property {string} createdAt - Creation timestamp (ISO string)
 */

/**
 * @typedef {Object} Location
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} Document
 * @property {string} id - Unique document identifier
 * @property {string} projectId - Associated project ID
 * @property {string} name - Document name
 * @property {string} type - File type (pdf, jpg, etc.)
 * @property {string} size - File size (formatted string)
 * @property {string} category - Document category
 * @property {string} url - Document URL
 * @property {string} uploadedBy - Person who uploaded
 * @property {string} uploadedAt - Upload timestamp (ISO string)
 * @property {DocumentMetadata} metadata - Additional metadata
 */

/**
 * @typedef {Object} DocumentMetadata
 * @property {boolean} compressed - Whether document was compressed
 * @property {number} originalSize - Original file size in bytes
 * @property {number} compressedSize - Compressed file size in bytes
 * @property {string} compressionRatio - Compression ratio percentage
 * @property {string} taskId - Associated task ID (if applicable)
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email
 * @property {string} name - User full name
 * @property {string} company - Company name
 * @property {string} role - User role
 * @property {string} avatar - Avatar URL
 * @property {Subscription} subscription - Subscription details
 */

/**
 * @typedef {Object} Subscription
 * @property {'trial'|'basic'|'professional'|'enterprise'} plan - Subscription plan
 * @property {'trial'|'active'|'expired'|'cancelled'} status - Subscription status
 * @property {string} expiresAt - Expiration date (ISO string)
 */

/**
 * @typedef {Object} OfflineChange
 * @property {string} id - Unique change identifier
 * @property {'create'|'update'|'delete'} type - Change type
 * @property {string} entity - Entity type (projects, tasks, etc.)
 * @property {Object} data - Change data
 * @property {string} timestamp - Change timestamp (ISO string)
 * @property {number} retryCount - Number of retry attempts
 * @property {'high'|'normal'|'low'} priority - Change priority
 * @property {number} estimatedDuration - Estimated sync duration in ms
 * @property {string} error - Error message (if failed)
 * @property {string} lastFailedAt - Last failure timestamp (ISO string)
 */

/**
 * @typedef {Object} SyncStatus
 * @property {number} pendingCount - Number of pending changes
 * @property {number} failedCount - Number of failed changes
 * @property {number} highPriorityCount - Number of high priority changes
 * @property {boolean} syncInProgress - Whether sync is in progress
 * @property {string} lastSync - Last sync timestamp (ISO string)
 * @property {boolean} hasChanges - Whether there are any changes
 * @property {number} estimatedSyncTime - Estimated sync time in ms
 * @property {SyncStats} syncStats - Sync statistics
 */

/**
 * @typedef {Object} SyncStats
 * @property {number} totalSynced - Total number of synced changes
 * @property {number} totalFailed - Total number of failed changes
 * @property {number} lastSyncDuration - Last sync duration in ms
 * @property {number} averageSyncTime - Average sync time in ms
 */

/**
 * @typedef {Object} FormValidationError
 * @property {string} field - Field name
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether form is valid
 * @property {Object.<string, string>} errors - Field errors
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request was successful
 * @property {*} data - Response data
 * @property {string} error - Error message (if unsuccessful)
 */

/**
 * @typedef {Object} NotificationMessage
 * @property {string} id - Unique notification identifier
 * @property {'success'|'error'|'warning'|'info'} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {number} duration - Display duration in ms
 * @property {string} timestamp - Creation timestamp (ISO string)
 */

// Export type definitions for use in other files
export {}