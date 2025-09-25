/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} [profileImageUrl]
 * @property {Date|string} createdAt
 * @property {Date|string} updatedAt
 */

/**
 * @typedef {Object} Todo
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {boolean} completed
 * @property {'pending'|'in_progress'|'completed'} status
 * @property {'Urgente'|'Moyenne'|'Basse'} priority
 * @property {string} createdBy
 * @property {number} userId
 * @property {User} [user]
 * @property {number} [assignedToId]
 * @property {User} [assignedTo]
 * @property {string} [imageUrl]
 * @property {string} [audioUrl]
 * @property {Date|string} [startDateTime]
 * @property {Date|string} [endDateTime]
 * @property {Date|string} [completedAt]
 * @property {Date|string} createdAt
 * @property {Date|string} updatedAt
 */

/**
 * @typedef {Object} Notification
 * @property {number} id
 * @property {'task_assigned'|'task_completed'|'task_reminder'} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} isRead
 * @property {number} recipientId
 * @property {User} recipient
 * @property {number} [senderId]
 * @property {User} [sender]
 * @property {number} [todoId]
 * @property {string} [todoTitle]
 * @property {Date|string} createdAt
 * @property {Date|string} updatedAt
 */

/**
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 */

/**
 * @typedef {Object} Toast
 * @property {number} id
 * @property {ToastType} type
 * @property {string} title
 * @property {string} [message]
 * @property {number} duration
 */

export {};