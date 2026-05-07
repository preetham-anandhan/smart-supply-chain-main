// ==============================================
// Client Utilities
// ==============================================

/**
 * Format duration from minutes to human-readable string.
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Format distance in km.
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Get priority color.
 */
export function getPriorityColor(priority) {
  const colors = {
    critical: '#ef4444',
    express: '#f59e0b',
    standard: '#3b82f6',
    economy: '#64748b',
  };
  return colors[priority] || colors.standard;
}

/**
 * Get status color.
 */
export function getStatusColor(status) {
  const colors = {
    pending: '#94a3b8',
    aggregating: '#8b5cf6',
    routed: '#3b82f6',
    assigned: '#f59e0b',
    in_transit: '#06b6d4',
    delivered: '#10b981',
    failed: '#ef4444',
  };
  return colors[status] || colors.pending;
}

/**
 * Relative time formatter.
 */
export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
