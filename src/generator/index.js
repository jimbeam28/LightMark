import path from 'path'
import { loadConfig } from '../utils/config.js'
import {
  ensureDir,
  remove,
  listMarkdownFiles,
  writeFile,
  writeJSON,
  copy,
  pathExists
} from '../utils/file.js'
import { parseArticle } from '../parser/frontmatter.js'
import { createMarkdownRenderer, markdownToHtml, extractExcerpt } from '../parser/markdown.js'
import { processHeadings } from '../parser/toc.js'
import { buildSiteData, createPageContext } from './site.js'
import { generateAllIndices } from './search.js'
import { createRenderer, render } from '../renderer/nunjucks.js'

/**
 * Build the static site
 * @param {string} rootDir - Root directory of the site
 * @param {Object} options - Build options
 * @returns {Promise<Object>} - Build result
 */
export async function build(rootDir, options = {}) {
  console.log('Starting build...')

  // 1. Load configuration
  const config = await loadConfig(rootDir)
  console.log(`Site: ${config.title}`)

  // 2. Setup paths
  const markdownDir = path.join(rootDir, 'markdown')
  const themesDir = path.join(rootDir, 'themes')
  const outputDir = path.join(rootDir, options.output || config.output)
  const themeDir = path.join(themesDir, config.theme)

  // 3. Clean output directory
  await remove(outputDir)
  await ensureDir(outputDir)

  // 4. Parse all articles
  console.log('Parsing articles...')
  const articles = await parseAllArticles(markdownDir, config)
  console.log(`Found ${articles.length} articles`)

  // 5. Build site data
  const siteData = buildSiteData(config, articles)

  // 6. Generate search indices
  const indices = generateAllIndices(siteData)

  // 7. Load theme and create renderer
  const renderer = createRenderer(themeDir)

  // 8. Render pages
  console.log('Rendering pages...')
  await renderPages(renderer, siteData, indices, outputDir)

  // 9. Copy theme assets
  const assetsSrc = path.join(themeDir, 'assets')
  const assetsDest = path.join(outputDir, 'assets')
  const assetsExists = await pathExists(assetsSrc)
  if (assetsExists) {
    await copy(assetsSrc, assetsDest)
    console.log('Copied theme assets')
  }

  // 10. Write search index
  const searchIndexPath = path.join(outputDir, 'assets', 'search-index.json')
  await writeJSON(searchIndexPath, indices.search)
  console.log('Generated search index')

  console.log('Build complete!')

  return {
    articlesCount: articles.length,
    seriesCount: siteData.series.length,
    tagsCount: Object.keys(siteData.tags).length
  }
}

/**
 * Parse all markdown articles
 * @param {string} markdownDir - Markdown directory
 * @param {Object} config - Site configuration
 * @returns {Promise<Array>} - Array of article objects
 */
async function parseAllArticles(markdownDir, config) {
  const articles = []
  const md = await createMarkdownRenderer()

  // Get all markdown files
  const files = await listMarkdownFiles(markdownDir)

  for (const filePath of files) {
    try {
      // Parse front matter and metadata
      const article = await parseArticle(filePath, markdownDir)

      // Convert markdown to HTML
      const html = await markdownToHtml(article.rawContent, md)

      // Process headings (add IDs and extract TOC)
      const { html: processedHtml, toc } = processHeadings(
        html,
        config.markdown?.tocLevel || [2, 3, 4]
      )

      // Extract excerpt if not provided
      if (!article.excerpt) {
        article.excerpt = extractExcerpt(
          processedHtml,
          config.markdown?.excerptLength || 200
        )
      }

      // Add processed content
      article.content = processedHtml
      article.toc = toc

      articles.push(article)
    } catch (err) {
      console.error(`Error parsing ${filePath}: ${err.message}`)
    }
  }

  return articles
}

/**
 * Render all pages
 * @param {Object} renderer - Nunjucks renderer
 * @param {Object} siteData - Site data
 * @param {Object} indices - Search indices
 * @param {string} outputDir - Output directory
 */
async function renderPages(renderer, siteData, indices, outputDir) {
  // Render homepage
  await renderHomePage(renderer, siteData, outputDir)

  // Render series pages
  await renderSeriesPages(renderer, siteData, outputDir)

  // Render article pages
  await renderArticlePages(renderer, siteData, outputDir)

  // Render tags pages
  await renderTagsPages(renderer, siteData, indices, outputDir)
}

/**
 * Render homepage
 */
async function renderHomePage(renderer, siteData, outputDir) {
  const context = createPageContext('home', siteData, {
    title: siteData.site.title
  })

  const html = render(renderer, 'home.html', context)
  await writeFile(path.join(outputDir, 'index.html'), html)
}

/**
 * Render series pages
 */
async function renderSeriesPages(renderer, siteData, outputDir) {
  for (const series of siteData.series) {
    const seriesDir = path.join(outputDir, 'series', series.name)
    await ensureDir(seriesDir)

    const context = createPageContext('series', siteData, {
      series,
      title: series.title
    })

    const html = render(renderer, 'series.html', context)
    await writeFile(path.join(seriesDir, 'index.html'), html)
  }
}

/**
 * Render article pages
 */
async function renderArticlePages(renderer, siteData, outputDir) {
  for (const article of siteData.articles) {
    if (!article.series) continue

    const articleDir = path.join(outputDir, 'series', article.series)
    await ensureDir(articleDir)

    const context = createPageContext('article', siteData, {
      article,
      content: article.content,
      toc: article.toc,
      series: siteData.series.find(s => s.name === article.series),
      title: article.title
    })

    const html = render(renderer, 'article.html', context)
    await writeFile(path.join(articleDir, `${article.slug}.html`), html)
  }
}

/**
 * Render tags pages
 */
async function renderTagsPages(renderer, siteData, indices, outputDir) {
  // Tags index page
  const tagsDir = path.join(outputDir, 'tags')
  await ensureDir(tagsDir)

  const tagsContext = createPageContext('tags', siteData, {
    tags: indices.tags,
    title: 'Tags'
  })

  const tagsHtml = render(renderer, 'tags.html', tagsContext)
  await writeFile(path.join(tagsDir, 'index.html'), tagsHtml)

  // Individual tag pages
  for (const [tagName, tagArticles] of Object.entries(siteData.tags)) {
    const tagDir = path.join(tagsDir, tagName)
    await ensureDir(tagDir)

    const context = createPageContext('tag', siteData, {
      tag: tagName,
      articles: tagArticles,
      title: `Tag: ${tagName}`
    })

    const html = render(renderer, 'tag.html', context)
    await writeFile(path.join(tagDir, 'index.html'), html)
  }
}

export default {
  build
}