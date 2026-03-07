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
 * @param {Object} urlGenerator - URL generator instance
 * @returns {Object} - Site data structure
 */
export function buildSiteData(config, articles, urlGenerator) {
  const { series, tags } = organizeData(articles)

  // Generate URLs for articles and add prev/next navigation
  for (const article of articles) {
    article.url = urlGenerator.article(article)
  }

  // Add prev/next navigation for articles within each series
  for (const s of series) {
    for (let i = 0; i < s.articles.length; i++) {
      const article = s.articles[i]
      article.prev = i > 0 ? s.articles[i - 1] : null
      article.next = i < s.articles.length - 1 ? s.articles[i + 1] : null
    }
  }

  // Generate URLs for series
  for (const s of series) {
    s.url = urlGenerator.series(s.name)
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
 * Generate page data for templates
 * @param {string} template - Template name
 * @param {string} outputPath - Output file path (for calculating relative paths)
 * @param {Object} data - Site data
 * @param {Object} urlGenerator - URL generator instance
 * @param {Object} extra - Extra page-specific data
 * @returns {Object} - Page context
 */
export function createPageContext(template, outputPath, data, urlGenerator, extra = {}) {
  return {
    site: data.site,
    allSeries: data.series,
    allTags: Object.keys(data.tags).sort(),
    page: {
      template,
      outputPath,
      ...extra
    },
    // Helper for templates to calculate relative paths
    rootPath: urlGenerator.rootPath(outputPath),
    ...extra
  }
}

export default {
  organizeData,
  buildSiteData,
  createPageContext
}
