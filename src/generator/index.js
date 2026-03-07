import path from 'path'
import { loadConfig } from '../utils/config.js'
import { loadThemeConfig, getTemplateForPage } from '../utils/theme.js'
import { createUrlGenerator } from '../utils/url.js'
import {
  ensureDir,
  remove,
  listMarkdownFiles,
  writeFile,
  copy,
  pathExists
} from '../utils/file.js'
import { parseArticle } from '../parser/frontmatter.js'
import { createMarkdownRenderer, markdownToHtml, extractExcerpt } from '../parser/markdown.js'
import { processHeadings } from '../parser/toc.js'
import { buildSiteData, createPageContext } from './site.js'
import { createRenderer, render } from '../renderer/nunjucks.js'

/**
 * Build the static site
 * @param {string} rootDir - Root directory of the site
 * @param {Object} options - Build options
 * @returns {Promise<Object>} - Build result
 */
export async function build(rootDir, options = {}) {
  console.log('Starting build...')

  // 1. Load site configuration
  const config = await loadConfig(rootDir)
  console.log(`Site: ${config.title}`)

  // 2. Setup paths
  const markdownDir = path.join(rootDir, 'markdown')
  const themesDir = path.join(rootDir, 'themes')
  const outputDir = path.join(rootDir, options.output || config.output)
  const themeDir = path.join(themesDir, config.theme)

  // 3. Load theme configuration
  const themeConfig = await loadThemeConfig(themeDir)
  console.log(`Theme: ${themeConfig.name}`)

  // 4. Create URL generator with theme config
  const urlGenerator = createUrlGenerator(themeConfig, config.url)

  // 5. Clean output directory
  await remove(outputDir)
  await ensureDir(outputDir)

  // 6. Parse all articles
  console.log('Parsing articles...')
  const articles = await parseAllArticles(markdownDir, config, themeConfig)
  console.log(`Found ${articles.length} articles`)

  // 7. Build site data with URL generator
  const siteData = buildSiteData(config, articles, urlGenerator)

  // 8. Create renderer with URL generator
  const renderer = createRenderer(themeDir, urlGenerator)

  // 9. Render pages
  console.log('Rendering pages...')
  await renderPages(renderer, siteData, outputDir, urlGenerator, themeConfig)

  // 10. Copy theme assets
  const assetsSrc = path.join(themeDir, 'assets')
  const assetsDest = path.join(outputDir, 'assets')
  const assetsExists = await pathExists(assetsSrc)
  if (assetsExists) {
    await copy(assetsSrc, assetsDest)
    console.log('Copied theme assets')
  }

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
 * @param {Object} themeConfig - Theme configuration
 * @returns {Promise<Array>} - Array of article objects
 */
async function parseAllArticles(markdownDir, config, themeConfig) {
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
      // Use theme config for tocLevels if available
      const tocLevels = themeConfig.config?.tocLevels || config.markdown?.tocLevel || [2, 3, 4]
      const { html: processedHtml, toc } = processHeadings(html, tocLevels)

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
      throw err
    }
  }

  return articles
}

/**
 * Render all pages using theme configuration
 * @param {Object} renderer - Nunjucks renderer
 * @param {Object} siteData - Site data
 * @param {string} outputDir - Output directory
 * @param {Object} urlGenerator - URL generator
 * @param {Object} themeConfig - Theme configuration
 */
async function renderPages(renderer, siteData, outputDir, urlGenerator, themeConfig) {
  // Define page renderers based on theme config
  const pageRenderers = [
    {
      type: 'home',
      getItems: () => [{ key: 'home', data: {} }],
      getContext: (item) => ({
        title: siteData.site.title
      })
    },
    {
      type: 'series',
      getItems: () => siteData.series.map(s => ({ key: s.name, data: { series: s } })),
      getContext: (item) => ({
        series: item.data.series,
        title: item.data.series.title
      })
    },
    {
      type: 'article',
      getItems: () => siteData.articles
        .filter(a => a.series)
        .map(a => ({ key: a.slug, data: { article: a } })),
      getContext: (item) => {
        const article = item.data.article
        return {
          article,
          content: article.content,
          toc: article.toc,
          series: siteData.series.find(s => s.name === article.series),
          title: article.title
        }
      }
    },
    {
      type: 'tags',
      getItems: () => {
        const tagIndices = Object.entries(siteData.tags).map(([name, articles]) => ({
          name,
          count: articles.length,
          url: urlGenerator.tag(name)
        })).sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.name.localeCompare(b.name)
        })
        return [{ key: 'index', data: { tags: tagIndices } }]
      },
      getContext: (item) => ({
        tags: item.data.tags,
        title: 'Tags'
      })
    },
    {
      type: 'tag',
      getItems: () => Object.entries(siteData.tags).map(([name, articles]) => ({
        key: name,
        data: { tag: name, articles }
      })),
      getContext: (item) => ({
        tag: item.data.tag,
        articles: item.data.articles,
        title: `Tag: ${item.data.tag}`
      })
    }
  ]

  // Render each page type
  for (const pageRenderer of pageRenderers) {
    await renderPageType(renderer, siteData, outputDir, urlGenerator, themeConfig, pageRenderer)
  }
}

/**
 * Render a specific page type
 * @param {Object} renderer - Nunjucks renderer
 * @param {Object} siteData - Site data
 * @param {string} outputDir - Output directory
 * @param {Object} urlGenerator - URL generator
 * @param {Object} themeConfig - Theme configuration
 * @param {Object} pageRenderer - Page renderer configuration
 */
async function renderPageType(renderer, siteData, outputDir, urlGenerator, themeConfig, pageRenderer) {
  const { type, getItems, getContext } = pageRenderer

  // Get template from theme config
  const template = getTemplateForPage(themeConfig, type)

  // Get items to render
  const items = getItems()

  for (const item of items) {
    // Generate output path
    const outputPath = generateOutputPath(type, item, themeConfig, urlGenerator)
    const fullOutputPath = path.join(outputDir, outputPath)

    // Ensure directory exists
    await ensureDir(path.dirname(fullOutputPath))

    // Create context
    const extra = getContext(item)
    const context = createPageContext(type, outputPath, siteData, urlGenerator, extra)

    // Render and write
    const html = render(renderer, template, context)
    await writeFile(fullOutputPath, html)
  }
}

/**
 * Generate output path for a page
 * @param {string} pageType - Page type
 * @param {Object} item - Item with key and data
 * @param {Object} themeConfig - Theme configuration
 * @param {Object} urlGenerator - URL generator
 * @returns {string} - Output file path
 */
function generateOutputPath(pageType, item, themeConfig, urlGenerator) {
  switch (pageType) {
    case 'home':
      return 'index.html'
    case 'series':
      return urlGenerator.series(item.key)
    case 'article':
      return urlGenerator.article(item.data.article)
    case 'tags':
      return urlGenerator.tags()
    case 'tag':
      return urlGenerator.tag(item.key)
    default:
      throw new Error(`Unknown page type: ${pageType}`)
  }
}

