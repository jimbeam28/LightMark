import path from 'path'
import { ensureDir, writeFile, pathExists, listFiles } from '../../utils/file.js'
import { slugify } from '../../utils/slug.js'

/**
 * Create a new article
 * @param {string} series - Series name
 * @param {Object} options - Command options
 * @param {string} [options.title] - Article title
 * @param {string} [options.root] - Site root directory
 */
export async function newArticle(series, options = {}) {
  const rootDir = options.root || process.cwd()
  const markdownDir = path.join(rootDir, 'markdown')
  const seriesDir = path.join(markdownDir, series)

  // Ensure series directory exists
  await ensureDir(seriesDir)

  // Determine next order number
  const nextOrder = await getNextOrder(seriesDir)
  const orderStr = String(nextOrder).padStart(2, '0')

  // Generate slug from title or default
  const title = options.title || 'New Article'
  const slug = slugify(title)
  const filename = `${orderStr}-${slug}.md`
  const filePath = path.join(seriesDir, filename)

  // Check if file already exists
  if (await pathExists(filePath)) {
    throw new Error(`File already exists: ${filePath}`)
  }

  // Create markdown content
  const content = createMarkdownContent(title, series, options)

  // Write file
  await writeFile(filePath, content)

  console.log(`Created: ${path.relative(rootDir, filePath)}`)

  return filePath
}

/**
 * Get next order number for a series
 * @param {string} seriesDir - Series directory path
 * @returns {Promise<number>}
 */
async function getNextOrder(seriesDir) {
  const files = await listFiles(seriesDir)

  let maxOrder = 0
  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const match = file.match(/^(\d+)/)
    if (match) {
      const order = parseInt(match[1], 10)
      if (order > maxOrder) {
        maxOrder = order
      }
    }
  }

  return maxOrder + 1
}

/**
 * Create markdown content with front matter
 * @param {string} title - Article title
 * @param {string} series - Series name
 * @param {Object} options - Additional options
 * @returns {string}
 */
function createMarkdownContent(title, series, options = {}) {
  const today = new Date().toISOString().split('T')[0]
  const tags = options.tags || []

  let frontMatter = `---
title: ${title}
date: ${today}`

  if (tags.length > 0) {
    frontMatter += `
tags: [${tags.join(', ')}]`
  }

  if (options.excerpt) {
    frontMatter += `
excerpt: ${options.excerpt}`
  }

  frontMatter += `
---

# ${title}

Start writing your content here...
`

  return frontMatter
}