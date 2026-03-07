import yaml from 'js-yaml'
import fse from 'fs-extra'
import path from 'path'

/**
 * Default theme configuration
 */
const defaultThemeConfig = {
  name: 'default',
  version: '1.0.0',
  description: '',
  author: '',
  license: 'MIT',
  features: [],
  dependencies: [],
  config: {
    tocLevels: [2, 3, 4],
    defaultDarkMode: false,
    codeTheme: 'github-dark'
  },
  // Page type to template mapping
  pages: {
    home: { template: 'home.html', output: 'index.html' },
    series: { template: 'series.html', output: 'series/{name}/index.html' },
    article: { template: 'article.html', output: 'series/{series}/{slug}.html' },
    tags: { template: 'tags.html', output: 'tags/index.html' },
    tag: { template: 'tag.html', output: 'tags/{name}/index.html' }
  }
}

/**
 * Load and parse theme.yaml configuration file
 * @param {string} themeDir - The theme directory path
 * @returns {Promise<Object>} - Merged theme configuration object
 */
export async function loadThemeConfig(themeDir) {
  const configPath = path.join(themeDir, 'theme.yaml')

  // Check if config file exists
  const exists = await fse.pathExists(configPath)
  if (!exists) {
    console.warn(`Warning: theme.yaml not found in ${themeDir}, using default config`)
    return { ...defaultThemeConfig, themeDir }
  }

  try {
    const content = await fse.readFile(configPath, 'utf-8')
    const userConfig = yaml.load(content) || {}

    // Deep merge with defaults
    const config = deepMerge(defaultThemeConfig, userConfig)
    config.themeDir = themeDir

    return config
  } catch (err) {
    console.error(`Error parsing theme.yaml: ${err.message}`)
    throw err
  }
}

/**
 * Get template name for a page type
 * @param {Object} themeConfig - Theme configuration
 * @param {string} pageType - Page type (home, series, article, etc.)
 * @returns {string} - Template file name
 */
export function getTemplateForPage(themeConfig, pageType) {
  const page = themeConfig.pages?.[pageType]
  if (!page) {
    throw new Error(`Unknown page type: ${pageType}. Define it in theme.yaml pages mapping.`)
  }
  return page.template
}

/**
 * Get output path pattern for a page type
 * @param {Object} themeConfig - Theme configuration
 * @param {string} pageType - Page type
 * @returns {string} - Output path pattern with placeholders
 */
export function getOutputPatternForPage(themeConfig, pageType) {
  const page = themeConfig.pages?.[pageType]
  if (!page) {
    throw new Error(`Unknown page type: ${pageType}`)
  }
  return page.output
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object') {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    } else {
      result[key] = source[key]
    }
  }

  return result
}

export { defaultThemeConfig }
export default {
  loadThemeConfig,
  getTemplateForPage,
  getOutputPatternForPage,
  defaultThemeConfig
}
