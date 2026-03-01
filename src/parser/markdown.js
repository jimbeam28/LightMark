import MarkdownIt from 'markdown-it'
import { createHighlighter } from 'shiki'

let highlighter = null

/**
 * Initialize Shiki highlighter
 */
async function initHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c', 'cpp', 'bash', 'json', 'yaml', 'markdown', 'html', 'css', 'sql', 'shell']
    })
  }
  return highlighter
}

/**
 * Create markdown renderer with code highlighting
 * @returns {Promise<MarkdownIt>}
 */
export async function createMarkdownRenderer() {
  await initHighlighter()

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code, lang) => {
      try {
        return highlighter.codeToHtml(code, {
          lang: lang || 'text',
          themes: {
            light: 'github-light',
            dark: 'github-dark'
          }
        })
      } catch {
        return `<pre><code>${escapeHtml(code)}</code></pre>`
      }
    }
  })

  return md
}

/**
 * Convert markdown to HTML
 * @param {string} markdown - Markdown content
 * @param {MarkdownIt} [md] - Markdown renderer instance
 * @returns {Promise<string>} - HTML content
 */
export async function markdownToHtml(markdown, md) {
  const renderer = md || await createMarkdownRenderer()
  return renderer.render(markdown)
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeHtml(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return str.replace(/[&<>"']/g, char => htmlEntities[char])
}

/**
 * Extract excerpt from HTML content
 * @param {string} html - HTML content
 * @param {number} length - Maximum excerpt length
 * @returns {string} - Plain text excerpt
 */
export function extractExcerpt(html, length = 200) {
  // Remove HTML tags
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= length) {
    return text
  }

  return text.slice(0, length).trim() + '...'
}

export default {
  createMarkdownRenderer,
  markdownToHtml,
  extractExcerpt
}