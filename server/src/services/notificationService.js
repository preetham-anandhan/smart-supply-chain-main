// ==============================================
// Notification Service — Alerts & updates
// ==============================================

const { createLogger } = require('../../../shared/utils/logger');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('NOTIFICATION');

// In-memory notification store
const notifications = [];

/**
 * Send a notification (logged + stored + emitted via socket).
 */
function sendNotification(type, message, data = {}) {
  const notification = {
    id: `NOTIF-${Date.now()}`,
    type,
    message,
    data,
    read: false,
    created_at: new Date().toISOString(),
  };

  notifications.push(notification);
  if (notifications.length > 100) notifications.shift(); // Keep last 100

  eventBus.emit(EVENTS.NOTIFICATION_SEND, notification);
  log.info(`[${type}] ${message}`);

  return notification;
}

/**
 * Get all unread notifications.
 */
function getUnreadNotifications() {
  return notifications.filter((n) => !n.read);
}

/**
 * Get recent notifications.
 */
function getRecentNotifications(limit = 20) {
  return notifications.slice(-limit).reverse();
}

module.exports = { sendNotification, getUnreadNotifications, getRecentNotifications };
