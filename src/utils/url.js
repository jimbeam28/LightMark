import path from 'path'

/**
 * URL Generator class for managing URL generation
 * Supports configurable URL patterns from theme.yaml
 */
export class UrlGenerator {
  constructor(themeConfig, siteUrl = '') {
    this.pages = themeConfig.pages || {}
    this.siteUrl = (siteUrl || '').replace(/\/$/, '') // Remove trailing slash
  }

  /**
   * Generate URL for an article
   * @param {Object} article - Article object
   * @returns {string} - Relative URL
   */
  article(article) {
    const pattern = this.pages.article?.output || 'series/{series}/{slug}.html'

    if (article.series) {
      return this._replace(pattern, {
        series: article.series,
        slug: article.slug
      })
    }
    return `${article.slug}.html`
  }

  /**
   * Generate URL for a series
   * @param {string|Object} series - Series name or series object
   * @returns {string} - Relative URL
   */
  series(series) {
    const name = typeof series === 'string' ? series : series.name
    const pattern = this.pages.series?.output || 'series/{name}/index.html'
    return this._replace(pattern, { name })
  }

  /**
   * Generate URL for tags index page
   * @returns {string} - Relative URL
   */
  tags() {
    const pattern = this.pages.tags?.output || 'tags/index.html'
    return pattern
  }

  /**
   * Generate URL for a specific tag
   * @param {string} tagName - Tag name
   * @returns {string} - Relative URL
   */
  tag(tagName) {
    const pattern = this.pages.tag?.output || 'tags/{name}/index.html'
    return this._replace(pattern, { name: tagName })
  }

  /**
   * Generate URL for home page
   * @returns {string} - Relative URL
   */
  home() {
    return this.pages.home?.output || 'index.html'
  }

  /**
   * Generate asset URL
   * @param {string} assetPath - Asset path (e.g., 'css/style.css')
   * @returns {string} - Relative URL
   */
  asset(assetPath) {
    // Remove leading slash if present
    assetPath = assetPath.replace(/^\//, '')
    return `assets/${assetPath}`
  }

  /**
   * Get relative path from current page to another path
   * @param {string} fromPage - Current page path (e.g., 'series/go/index.html')
   * @param {string} toPath - Target path (e.g., 'tags/index.html')
   * @returns {string} - Relative path
   */
  relative(fromPage, toPath) {
    // Remove leading ./ from both
    fromPage = fromPage.replace(/^\.\//, '')
    toPath = toPath.replace(/^\.\//, '')

    // Get directory of fromPage
    const fromDir = path.dirname(fromPage)

    // Calculate relative path
    const relativePath = path.relative(fromDir, toPath)

    // Ensure it starts with ./ if in same directory
    if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
      return './' + relativePath
    }

    return relativePath
  }

  /**
   * Get root path (relative path to site root) for a page
   * @param {string} pagePath - Page path
   * @returns {string} - Root path (e.g., '../../')
   */
  rootPath(pagePath) {
    const depth = pagePath.split('/').length - 1
    if (depth <= 0) {
      return './'
    }
    return '../'.repeat(depth)
  }

  /**
   * Replace placeholders in pattern
   * @private
   */
  _replace(pattern, values) {
    return pattern.replace(/{(\w+)}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match
    })
  }
}

/**
 * Create URL generator instance
 * @param {Object} themeConfig - Theme configuration
 * @param {string} siteUrl - Site base URL
 * @returns {UrlGenerator}
 */
export function createUrlGenerator(themeConfig, siteUrl = '') {
  return new UrlGenerator(themeConfig, siteUrl)
}

export default {
  UrlGenerator,
  createUrlGenerator
}
