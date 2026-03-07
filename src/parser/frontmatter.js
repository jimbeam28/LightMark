import matter from 'gray-matter'
import path from 'path'
import { readFile, generateSlug, parseOrder } from '../utils/file.js'

/**
 * Parse front matter from markdown content
 * @param {string} content - Raw markdown content with front matter
 * @returns {Object} - { data, content, excerpt }
 */
export function parseFrontMatter(content) {
  const result = matter(content)
  return {
    data: result.data || {},
    content: result.content,
    excerpt: result.excerpt || ''
  }
}

/**
 * Parse article from file path
 * @param {string} filePath - Absolute file path
 * @param {string} markdownDir - Markdown root directory
 * @returns {Object} - Article metadata and content
 */
export async function parseArticle(filePath, markdownDir) {
  // Read file content
  const rawContent = await readFile(filePath)

  // Parse front matter
  const { data, content } = parseFrontMatter(rawContent)

  // Get relative path from markdown directory
  const relativePath = path.relative(markdownDir, filePath)

  // Parse series from directory structure
  const parts = relativePath.split(path.sep)
  const series = parts.length > 1 ? parts[0] : ''

  // Parse filename info
  const extname = path.extname(filePath)
  const filename = path.basename(filePath, extname)

  // Extract order and slug from filename
  const order = parseOrder(filename)
  const slug = generateSlug(filename)

  // Build article object
  const article = {
    // From front matter
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString().split('T')[0],
    tags: data.tags || [],
    excerpt: data.excerpt || '',

    // From file structure
    series,
    seriesTitle: data.series || series,
    order,
    slug,
    filename,

    // Raw content
    rawContent: content,

    // File info
    filePath,
    relativePath
  }

  return article
}

