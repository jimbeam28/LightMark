import yaml from 'js-yaml'
import fse from 'fs-extra'
import path from 'path'

const defaultConfig = {
  title: 'LightMark',
  description: '',
  author: '',
  url: '',
  language: 'zh-CN',
  theme: 'minimal',
  darkMode: true,
  output: 'dist',
  perPage: 20,
  markdown: {
    tocLevel: [2, 3, 4],
    excerptLength: 200
  },
  seo: {
    googleAnalytics: '',
    baiduAnalytics: ''
  }
}

/**
 * Load and parse site.yaml configuration file
 * @param {string} rootDir - The root directory of the site
 * @returns {Promise<Object>} - Merged configuration object
 */
export async function loadConfig(rootDir) {
  const configPath = path.join(rootDir, 'site.yaml')

  // Check if config file exists
  const exists = await fse.pathExists(configPath)
  if (!exists) {
    console.warn(`Warning: site.yaml not found in ${rootDir}, using default config`)
    return { ...defaultConfig, rootDir }
  }

  try {
    const content = await fse.readFile(configPath, 'utf-8')
    const userConfig = yaml.load(content)

    // Deep merge with defaults
    const config = deepMerge(defaultConfig, userConfig)
    config.rootDir = rootDir

    return config
  } catch (err) {
    console.error(`Error parsing site.yaml: ${err.message}`)
    throw err
  }
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

export { defaultConfig }