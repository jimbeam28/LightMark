import { slugFromHeading, stripHtml } from '../utils/slug.js'

/**
 * Extract table of contents from HTML
 * @param {string} html - HTML content
 * @param {number[]} levels - Heading levels to include (e.g., [2, 3, 4])
 * @returns {Array<{level: number, text: string, id: string}>} - TOC entries
 */
export function extractToc(html, levels = [2, 3, 4]) {
  const toc = []
  const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)

    if (levels.includes(level)) {
      const text = stripHtml(match[2]).trim()
      const id = slugFromHeading(text, toc.length)

      toc.push({
        level,
        text,
        id
      })
    }
  }

  return toc
}

/**
 * Add IDs to headings in HTML
 * @param {string} html - HTML content
 * @param {number[]} levels - Heading levels to process
 * @returns {string} - HTML with heading IDs
 */
export function addHeadingIds(html, levels = [2, 3, 4]) {
  const counter = {}
  let index = 0

  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const headingLevel = parseInt(level, 10)

    if (!levels.includes(headingLevel)) {
      return match
    }

    const text = stripHtml(content).trim()
    const id = slugFromHeading(text, index++)

    // Check if ID already exists
    if (attrs.includes('id=')) {
      return match
    }

    return `<h${level}${attrs} id="${id}">${content}</h${level}>`
  })
}

/**
 * Process HTML to add heading IDs and extract TOC
 * @param {string} html - HTML content
 * @param {number[]} levels - Heading levels to process
 * @returns {{html: string, toc: Array}} - Processed HTML and TOC
 */
export function processHeadings(html, levels = [2, 3, 4]) {
  const htmlWithIds = addHeadingIds(html, levels)
  const toc = extractToc(htmlWithIds, levels)

  return {
    html: htmlWithIds,
    toc
  }
}

