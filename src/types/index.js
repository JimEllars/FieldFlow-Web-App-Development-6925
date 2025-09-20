/**
 * @fileoverview Enhanced Type definitions for ForemanOS application
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
 * @property {ProjectMetadata} [metadata] - Additional project metadata
 */

/**
 * @typedef {Object} ProjectMetadata
 * @property {string} [contractNumber] - Contract reference number
 * @property {string} [permitNumber] - Building permit number
 * @property {Coordinates} [coordinates] - GPS coordinates
 * @property {string[]} [tags] - Project tags for categorization
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
 * @property {number} [actualHours] - Actual hours spent
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {string} updatedAt - Last update timestamp (ISO string)
 * @property {string} [completedAt] - Completion timestamp (ISO string)
 * @property {TaskDependency[]} [dependencies] - Task dependencies
 */

/**
 * @typedef {Object} TaskDependency
 * @property {string} taskId - Dependent task ID
 * @property {'finish-to-start'|'start-to-start'|'finish-to-finish'|'start-to-finish'} type - Dependency type
 */

/**
 * @typedef {Object} DailyLog
 * @property {string} id - Unique log identifier
 * @property {string} projectId - Associated project ID
 * @property {string} date - Log date (ISO string)
 * @property {string} weather - Weather conditions
 * @property {string} workCompleted - Description of work completed
 * @property {string} [notes] - Additional notes
 * @property {string[]} crew - Crew member names
 * @property {Material[]} materials - Materials used
 * @property {string[]} equipment - Equipment used
 * @property {Photo[]} photos - Associated photos
 * @property {string} submittedBy - Person who submitted the log
 * @property {string} submittedAt - Submission timestamp (ISO string)
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {SafetyIncident[]} [safetyIncidents] - Safety incidents reported
 */

/**
 * @typedef {Object} Material
 * @property {string} item - Material name
 * @property {string|number} quantity - Quantity used
 * @property {string} unit - Unit of measurement
 * @property {number} [cost] - Cost per unit
 * @property {string} [supplier] - Material supplier
 */

/**
 * @typedef {Object} SafetyIncident
 * @property {string} id - Incident identifier
 * @property {'near-miss'|'minor'|'major'} severity - Incident severity
 * @property {string} description - Incident description
 * @property {string} reportedBy - Person who reported
 * @property {string} timestamp - Incident timestamp (ISO string)
 */

/**
 * @typedef {Object} Photo
 * @property {string} id - Unique photo identifier
 * @property {string} name - Photo name
 * @property {string} url - Photo URL
 * @property {string} uploadedBy - Person who uploaded
 * @property {string} uploadedAt - Upload timestamp (ISO string)
 * @property {boolean} compressed - Whether photo was compressed
 * @property {string} [compressionRatio] - Compression ratio percentage
 * @property {Coordinates} [location] - GPS coordinates where photo was taken
 * @property {PhotoMetadata} [metadata] - Additional photo metadata
 */

/**
 * @typedef {Object} PhotoMetadata
 * @property {number} [width] - Image width in pixels
 * @property {number} [height] - Image height in pixels
 * @property {string} [camera] - Camera model
 * @property {string} [timestamp] - Original photo timestamp
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
 * @property {string} [description] - Work description
 * @property {Coordinates} [location] - GPS location
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {boolean} [approved] - Whether entry is approved
 * @property {string} [approvedBy] - Who approved the entry
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} [accuracy] - GPS accuracy in meters
 */

/**
 * @typedef {Object} Document
 * @property {string} id - Unique document identifier
 * @property {string} projectId - Associated project ID
 * @property {string} name - Document name
 * @property {string} type - File type (pdf, jpg, etc.)
 * @property {string} size - File size (formatted string)
 * @property {number} sizeInBytes - File size in bytes
 * @property {string} category - Document category
 * @property {string} url - Document URL
 * @property {string} uploadedBy - Person who uploaded
 * @property {string} uploadedAt - Upload timestamp (ISO string)
 * @property {DocumentMetadata} [metadata] - Additional metadata
 * @property {string[]} [tags] - Document tags
 * @property {number} [version] - Document version number
 */

/**
 * @typedef {Object} DocumentMetadata
 * @property {boolean} compressed - Whether document was compressed
 * @property {number} [originalSize] - Original file size in bytes
 * @property {number} [compressedSize] - Compressed file size in bytes
 * @property {string} [compressionRatio] - Compression ratio percentage
 * @property {string} [taskId] - Associated task ID (if applicable)
 * @property {string} [checksum] - File checksum for integrity verification
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email
 * @property {string} name - User full name
 * @property {string} company - Company name
 * @property {string} role - User role
 * @property {string} [avatar] - Avatar URL
 * @property {Subscription} subscription - Subscription details
 * @property {UserPreferences} [preferences] - User preferences
 * @property {string} [phone] - Phone number
 * @property {string} createdAt - Account creation timestamp
 * @property {string} lastLoginAt - Last login timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} language - Preferred language
 * @property {string} timezone - User timezone
 * @property {string} dateFormat - Preferred date format
 * @property {string} timeFormat - Preferred time format (12h/24h)
 * @property {boolean} emailNotifications - Email notifications enabled
 * @property {boolean} pushNotifications - Push notifications enabled
 */

/**
 * @typedef {Object} Subscription
 * @property {'trial'|'basic'|'professional'|'enterprise'} plan - Subscription plan
 * @property {'trial'|'active'|'expired'|'cancelled'} status - Subscription status
 * @property {string} expiresAt - Expiration date (ISO string)
 * @property {SubscriptionLimits} limits - Plan limits
 * @property {PaymentMethod} [paymentMethod] - Payment method details
 */

/**
 * @typedef {Object} SubscriptionLimits
 * @property {number} maxProjects - Maximum number of projects
 * @property {number} maxUsers - Maximum number of users
 * @property {number} storageGB - Storage limit in GB
 * @property {boolean} advancedReporting - Advanced reporting enabled
 * @property {boolean} apiAccess - API access enabled
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} type - Payment method type (card, bank, etc.)
 * @property {string} brand - Card brand (Visa, MasterCard, etc.)
 * @property {string} last4 - Last 4 digits
 * @property {number} expMonth - Expiration month
 * @property {number} expYear - Expiration year
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
 * @property {string} [error] - Error message (if failed)
 * @property {string} [lastFailedAt] - Last failure timestamp (ISO string)
 * @property {string} userId - User who made the change
 * @property {ConflictResolution} [conflictResolution] - Conflict resolution strategy
 */

/**
 * @typedef {Object} ConflictResolution
 * @property {'client-wins'|'server-wins'|'merge'|'manual'} strategy - Resolution strategy
 * @property {Object} [mergedData] - Merged data for merge strategy
 * @property {string} [resolvedBy] - User who resolved the conflict
 * @property {string} [resolvedAt] - Resolution timestamp
 */

/**
 * @typedef {Object} SyncStatus
 * @property {number} pendingCount - Number of pending changes
 * @property {number} failedCount - Number of failed changes
 * @property {number} highPriorityCount - Number of high priority changes
 * @property {boolean} syncInProgress - Whether sync is in progress
 * @property {string} [lastSync] - Last sync timestamp (ISO string)
 * @property {boolean} hasChanges - Whether there are any changes
 * @property {number} estimatedSyncTime - Estimated sync time in ms
 * @property {SyncStats} syncStats - Sync statistics
 * @property {ConnectionQuality} connectionQuality - Current connection quality
 */

/**
 * @typedef {Object} ConnectionQuality
 * @property {'good'|'moderate'|'poor'|'offline'} level - Connection quality level
 * @property {number} [downlink] - Download speed in Mbps
 * @property {number} [rtt] - Round trip time in ms
 * @property {string} [effectiveType] - Effective connection type
 */

/**
 * @typedef {Object} SyncStats
 * @property {number} totalSynced - Total number of synced changes
 * @property {number} totalFailed - Total number of failed changes
 * @property {number} lastSyncDuration - Last sync duration in ms
 * @property {number} averageSyncTime - Average sync time in ms
 * @property {string} [lastSuccessful] - Last successful sync timestamp
 * @property {Object} byEntity - Sync stats broken down by entity type
 */

/**
 * @typedef {Object} FormValidationRule
 * @property {Function} validator - Validation function
 * @property {string} message - Error message
 * @property {boolean} [required] - Whether field is required
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether form is valid
 * @property {Object.<string,string>} errors - Field errors
 * @property {string[]} warnings - Non-blocking warnings
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request was successful
 * @property {*} [data] - Response data
 * @property {string} [error] - Error message (if unsuccessful)
 * @property {ApiMetadata} [metadata] - Response metadata
 */

/**
 * @typedef {Object} ApiMetadata
 * @property {number} timestamp - Response timestamp
 * @property {string} requestId - Unique request identifier
 * @property {number} [totalCount] - Total count for paginated responses
 * @property {number} [pageSize] - Page size for paginated responses
 * @property {number} [currentPage] - Current page number
 */

/**
 * @typedef {Object} NotificationMessage
 * @property {string} id - Unique notification identifier
 * @property {'success'|'error'|'warning'|'info'} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {number} duration - Display duration in ms
 * @property {string} timestamp - Creation timestamp (ISO string)
 * @property {NotificationAction[]} [actions] - Available actions
 * @property {boolean} [dismissible] - Whether notification can be dismissed
 */

/**
 * @typedef {Object} NotificationAction
 * @property {string} label - Action label
 * @property {Function} handler - Action handler function
 * @property {'primary'|'secondary'} [style] - Action button style
 */

/**
 * @typedef {Object} GeofenceArea
 * @property {string} id - Geofence identifier
 * @property {string} name - Geofence name
 * @property {Coordinates} center - Center coordinates
 * @property {number} radius - Radius in meters
 * @property {boolean} active - Whether geofence is active
 * @property {string} projectId - Associated project ID
 */

/**
 * @typedef {Object} WeatherData
 * @property {string} condition - Weather condition
 * @property {number} temperature - Temperature in Fahrenheit
 * @property {number} humidity - Humidity percentage
 * @property {number} windSpeed - Wind speed in mph
 * @property {string} [description] - Detailed weather description
 * @property {string} timestamp - Weather data timestamp
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} [cls] - Cumulative Layout Shift
 * @property {number} [fid] - First Input Delay
 * @property {number} [fcp] - First Contentful Paint
 * @property {number} [lcp] - Largest Contentful Paint
 * @property {number} [ttfb] - Time to First Byte
 * @property {number} [memoryUsed] - Memory usage in bytes
 * @property {number} [memoryTotal] - Total memory in bytes
 * @property {number} [pageLoadTime] - Page load time in ms
 */

// Export types for external use
export {}