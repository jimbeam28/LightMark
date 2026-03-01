import path from 'path'

/**
 * Organize articles into series and tags
 * @param {Array} articles - Array of article objects
 * @returns {Object} - { series, tags }
 */
export function organizeData(articles) {
  const seriesMap = new Map()
  const tagsMap = new Map()

  for (const article of articles) {
    // Organize by series
    const seriesName = article.series || 'default'

    if (!seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, {
        name: seriesName,
        title: article.seriesTitle || seriesName,
        articles: []
      })
    }

    seriesMap.get(seriesName).articles.push(article)

    // Organize by tags
    for (const tag of article.tags || []) {
      if (!tagsMap.has(tag)) {
        tagsMap.set(tag, [])
      }
      tagsMap.get(tag).push(article)
    }
  }

  // Sort articles within each series by order
  for (const series of seriesMap.values()) {
    series.articles.sort((a, b) => a.order - b.order)
  }

  // Convert maps to sorted arrays
  const series = Array.from(seriesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const tags = {}
  for (const [tag, tagArticles] of tagsMap.entries()) {
    tags[tag] = tagArticles.sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    )
  }

  return { series, tags }
}

/**
 * Build site data structure for templates
 * @param {Object} config - Site configuration
 * @param {Array} articles - Array of article objects
 * @returns {Object} - Site data structure
 */
export function buildSiteData(config, articles) {
  const { series, tags } = organizeData(articles)

  // Generate URLs for articles
  for (const article of articles) {
    article.url = generateArticleUrl(article)
  }

  // Generate URLs for series
  for (const s of series) {
    s.url = `/series/${s.name}/`
    if (s.articles.length > 0) {
      s.firstArticle = s.articles[0]
    }
  }

  return {
    site: {
      title: config.title,
      description: config.description,
      author: config.author,
      url: config.url,
      language: config.language
    },
    series,
    tags,
    articles: articles.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

/**
 * Generate URL for an article
 * @param {Object} article - Article object
 * @returns {string} - Article URL
 */
function generateArticleUrl(article) {
  if (article.series) {
    return `/series/${article.series}/${article.slug}.html`
  }
  return `/${article.slug}.html`
}

/**
 * Generate page data for templates
 * @param {string} template - Template name
 * @param {Object} data - Site data
 * @param {Object} extra - Extra page-specific data
 * @returns {Object} - Page context
 */
export function createPageContext(template, data, extra = {}) {
  return {
    site: data.site,
    allSeries: data.series,
    allTags: Object.keys(data.tags).sort(),
    page: {
      template,
      ...extra
    },
    ...extra
  }
}

export default {
  organizeData,
  buildSiteData,
  createPageContext
}