import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format bytes into human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Format seconds into mm:ss string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Format a Date to a readable timestamp string.
 * @param {Date|number|string} date
 * @returns {string}
 */
export function formatTimestamp(date) {
  if (!date) return '—'
  try {
    return format(new Date(date), 'HH:mm:ss')
  } catch {
    return '—'
  }
}

/**
 * Format a relative time string.
 * @param {Date|number|string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return '—'
  }
}

/**
 * Format round as "Round X / Y"
 * @param {number} current
 * @param {number} total
 * @returns {string}
 */
export function formatRound(current, total) {
  return `Round ${current} / ${total}`
}

/**
 * Format score as percentage string.
 * @param {number} score 0-1
 * @returns {string}
 */
export function formatScore(score) {
  if (score == null || isNaN(score)) return '—%'
  return `${Math.round(score * 100)}%`
}
