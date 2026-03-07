/**
 * Slug generation utilities
 * Provides different strategies for generating URL-friendly slugs
 */

/**
 * Default slug options
 */
const DEFAULT_OPTIONS = {
  maxLength: 50,
  fallback: 'article',
  allowChinese: true
}

/**
 * Get the character class regex for slug generation
 * @param {boolean} allowChinese - Whether to allow Chinese characters
 * @returns {RegExp} - Character class regex
 */
function getCharClassRegex(allowChinese) {
  // Word characters plus Chinese characters if enabled
  return allowChinese ? /[^\w\u4e00-\u9fa5]+/g : /[^\w]+/g
}

/**
 * Slugify a string (title/text to URL-friendly slug)
 * Converts to lowercase, replaces non-word chars with hyphens
 *
 * @param {string} text - Input text
 * @param {Object} options - Slug options
 * @param {number} options.maxLength - Maximum slug length
 * @param {string} options.fallback - Fallback value if slug is empty
 * @param {boolean} options.allowChinese - Whether to preserve Chinese characters
 * @returns {string} - Slugified string
 */
export function slugify(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (!text || typeof text !== 'string') {
    return opts.fallback
  }

  const charClass = getCharClassRegex(opts.allowChinese)

  return text
    .toLowerCase()
    .replace(charClass, '-')
    .replace(/^-|-$/g, '')
    .slice(0, opts.maxLength) || opts.fallback
}

/**
 * Generate slug from filename (removes leading order numbers)
 * e.g., "01-intro.md" -> "intro"
 *
 * @param {string} filename - Filename (with or without extension)
 * @returns {string} - Slug from filename
 */
export function slugFromFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  // Remove leading numbers and separator (dash or underscore)
  const slug = filename.replace(/^\d+[-_]?/, '')
  return slug || filename
}

/**
 * Generate ID from heading text (for TOC/anchor links)
 * Similar to slugify but with different fallback for headings
 *
 * @param {string} text - Heading text
 * @param {number} index - Index for fallback ID
 * @returns {string} - Generated ID
 */
export function slugFromHeading(text, index = 0) {
  const slug = slugify(text, { maxLength: 100, fallback: '' })

  // If slug is empty or too short, use index-based fallback
  if (slug.length < 2) {
    return `heading-${index}`
  }

  return slug
}

/**
 * Strip HTML tags from string
 * @param {string} str - String containing HTML
 * @returns {string} - Plain text without HTML tags
 */
export function stripHtml(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

/**
 * Escape HTML entities
 * @param {string} str - Plain text
 * @returns {string} - Text with HTML entities escaped
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return str.replace(/[&<>"']/g, char => htmlEntities[char])
}
