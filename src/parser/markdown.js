import MarkdownIt from 'markdown-it'
import { createHighlighter } from 'shiki'
import { escapeHtml } from '../utils/slug.js'

/**
 * Markdown renderer with Shiki code highlighting
 * Uses instance-based pattern for better testability
 */
export class MarkdownRenderer {
  /**
   * Default language list for syntax highlighting
   * Can be extended via configuration
   */
  static DEFAULT_LANGUAGES = [
    'javascript', 'typescript', 'python', 'go', 'rust',
    'java', 'c', 'cpp', 'bash', 'json', 'yaml',
    'markdown', 'html', 'css', 'sql', 'shell'
  ]

  /**
   * Default themes for light/dark mode
   */
  static DEFAULT_THEMES = ['github-dark', 'github-light']

  /**
   * Create a new MarkdownRenderer instance
   * @param {Object} options - Configuration options
   * @param {string[]} options.langs - Languages to support
   * @param {string[]} options.themes - Themes to bundle
   */
  constructor(options = {}) {
    this.langs = options.langs || MarkdownRenderer.DEFAULT_LANGUAGES
    this.themes = options.themes || MarkdownRenderer.DEFAULT_THEMES
    this.highlighter = null
    this.md = null
  }

  /**
   * Initialize the Shiki highlighter
   * @returns {Promise<void>}
   */
  async init() {
    if (this.highlighter) return

    this.highlighter = await createHighlighter({
      themes: this.themes,
      langs: this.langs
    })
  }

  /**
   * Get the configured MarkdownIt instance
   * @returns {Promise<MarkdownIt>}
   */
  async getRenderer() {
    if (this.md) return this.md

    await this.init()

    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (code, lang) => this.highlightCode(code, lang)
    })

    return this.md
  }

  /**
   * Highlight code using Shiki
   * @param {string} code - Code to highlight
   * @param {string} lang - Language identifier
   * @returns {string} - Highlighted HTML
   */
  highlightCode(code, lang) {
    if (!this.highlighter) {
      throw new Error('Renderer not initialized. Call init() first.')
    }

    try {
      return this.highlighter.codeToHtml(code, {
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

  /**
   * Render markdown to HTML
   * @param {string} markdown - Markdown content
   * @returns {Promise<string>} - HTML content
   */
  async render(markdown) {
    const renderer = await this.getRenderer()
    return renderer.render(markdown)
  }
}

/**
 * Create markdown renderer with code highlighting
 * Factory function for backward compatibility
 * @param {Object} options - Configuration options
 * @returns {Promise<MarkdownRenderer>}
 */
export async function createMarkdownRenderer(options = {}) {
  const renderer = new MarkdownRenderer(options)
  await renderer.init()
  return renderer
}

/**
 * Convert markdown to HTML
 * @param {string} markdown - Markdown content
 * @param {MarkdownRenderer} [renderer] - Optional renderer instance
 * @returns {Promise<string>} - HTML content
 */
export async function markdownToHtml(markdown, renderer) {
  const md = renderer || await createMarkdownRenderer()
  return md.render(markdown)
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
