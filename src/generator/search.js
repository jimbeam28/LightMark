/**
 * Generate search index from articles
 * @param {Array} articles - Array of article objects
 * @returns {Array} - Search index entries
 */
export function generateSearchIndex(articles) {
  const index = []

  for (const article of articles) {
    index.push({
      title: article.title,
      url: article.url,
      excerpt: article.excerpt || '',
      tags: article.tags || [],
      series: article.series || '',
      seriesTitle: article.seriesTitle || '',
      date: article.date
    })
  }

  // Sort by date descending
  index.sort((a, b) => new Date(b.date) - new Date(a.date))

  return index
}

/**
 * Generate tag index for search
 * @param {Object} tags - Tags object from site data
 * @returns {Array} - Tag index entries
 */
export function generateTagIndex(tags) {
  const index = []

  for (const [name, articles] of Object.entries(tags)) {
    index.push({
      name,
      count: articles.length,
      url: `/tags/${name}/`
    })
  }

  // Sort by count descending, then alphabetically
  index.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })

  return index
}

/**
 * Generate series index for navigation
 * @param {Array} series - Series array from site data
 * @returns {Array} - Series index entries
 */
export function generateSeriesIndex(series) {
  const index = []

  for (const s of series) {
    index.push({
      name: s.name,
      title: s.title,
      count: s.articles.length,
      url: s.url
    })
  }

  // Sort alphabetically by title
  index.sort((a, b) => a.title.localeCompare(b.title))

  return index
}

/**
 * Generate all search indices
 * @param {Object} siteData - Site data structure
 * @returns {Object} - All indices
 */
export function generateAllIndices(siteData) {
  return {
    search: generateSearchIndex(siteData.articles),
    tags: generateTagIndex(siteData.tags),
    series: generateSeriesIndex(siteData.series)
  }
}

export default {
  generateSearchIndex,
  generateTagIndex,
  generateSeriesIndex,
  generateAllIndices
}