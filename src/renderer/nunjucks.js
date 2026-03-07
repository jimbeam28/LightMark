import nunjucks from 'nunjucks'
import path from 'path'

/**
 * Create and configure Nunjucks environment
 * @param {string} themeDir - Theme directory path
 * @param {Object} urlGenerator - URL generator instance
 * @returns {nunjucks.Environment}
 */
export function createRenderer(themeDir, urlGenerator) {
  const templateDir = path.join(themeDir, 'templates')

  // Create environment with file system loader
  const env = nunjucks.configure(templateDir, {
    autoescape: true,
    noCache: true,
    watch: false
  })

  // Add custom filters
  addFilters(env)

  // Add custom globals
  addGlobals(env, urlGenerator)

  return env
}

/**
 * Add custom filters to Nunjucks environment
 * @param {nunjucks.Environment} env
 */
function addFilters(env) {
  // Date formatting filter
  env.addFilter('date', (dateStr, format = 'YYYY-MM-DD') => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
  })

  // Slugify filter
  env.addFilter('slug', (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
  })

  // Truncate filter
  env.addFilter('truncate', (str, length = 200) => {
    if (!str || str.length <= length) return str
    return str.slice(0, length).trim() + '...'
  })

  // Strip HTML filter
  env.addFilter('striptags', (str) => {
    if (!str) return ''
    return str.replace(/<[^>]+>/g, '')
  })

  // JSON stringify filter
  env.addFilter('json', (obj) => {
    return JSON.stringify(obj)
  })

  // Array filter - get unique items
  env.addFilter('unique', (arr) => {
    if (!Array.isArray(arr)) return arr
    return [...new Set(arr)]
  })

  // Sort by property
  env.addFilter('sortBy', (arr, prop, order = 'asc') => {
    if (!Array.isArray(arr)) return arr
    const sorted = [...arr].sort((a, b) => {
      if (a[prop] < b[prop]) return order === 'asc' ? -1 : 1
      if (a[prop] > b[prop]) return order === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  })
}

/**
 * Add global variables to Nunjucks environment
 * @param {nunjucks.Environment} env
 * @param {Object} urlGenerator - URL generator instance
 */
function addGlobals(env, urlGenerator) {
  // Add helper to check if variable is defined
  env.addGlobal('isDefined', (val) => {
    return val !== undefined && val !== null
  })

  // Add URL generator functions if provided
  if (urlGenerator) {
    // url('article', article) -> generates URL for article
    // url('series', seriesName) -> generates URL for series
    // url('tag', tagName) -> generates URL for tag
    // url('tags') -> generates URL for tags index
    // url('home') -> generates URL for home
    env.addGlobal('url', (type, ...args) => {
      switch (type) {
        case 'article':
          return urlGenerator.article(args[0])
        case 'series':
          return urlGenerator.series(args[0])
        case 'tag':
          return urlGenerator.tag(args[0])
        case 'tags':
          return urlGenerator.tags()
        case 'home':
          return urlGenerator.home()
        default:
          console.warn(`Unknown URL type: ${type}`)
          return '#'
      }
    })

    // asset('css/style.css') -> generates asset URL
    env.addGlobal('asset', (path) => {
      return urlGenerator.asset(path)
    })

    // relative(fromPage, toPath) -> generates relative path
    env.addGlobal('relative', (fromPage, toPath) => {
      return urlGenerator.relative(fromPage, toPath)
    })

    // Store urlGenerator for context helpers
    env.addGlobal('_urlGenerator', urlGenerator)
  }
}

/**
 * Render a template with context
 * @param {nunjucks.Environment} env - Nunjucks environment
 * @param {string} template - Template name
 * @param {Object} context - Template context
 * @returns {string} - Rendered HTML
 */
export function render(env, template, context) {
  return env.render(template, context)
}

/**
 * Render a string template
 * @param {nunjucks.Environment} env - Nunjucks environment
 * @param {string} str - Template string
 * @param {Object} context - Template context
 * @returns {string} - Rendered HTML
 */
export function renderString(env, str, context) {
  return env.renderString(str, context)
}

export default {
  createRenderer,
  render,
  renderString
}
