import path from 'path'
import { build } from '../../generator/index.js'

/**
 * Build the static site
 * @param {Object} options - Build options
 * @param {string} [options.config] - Config file path
 * @param {string} [options.output] - Output directory
 * @param {string} [options.root] - Site root directory
 */
export async function buildCommand(options = {}) {
  const rootDir = options.root || process.cwd()

  try {
    const result = await build(rootDir, {
      output: options.output
    })

    console.log(`
Build Summary:
  Articles: ${result.articlesCount}
  Series:   ${result.seriesCount}
  Tags:     ${result.tagsCount}
`)

    return result
  } catch (err) {
    console.error(`Build failed: ${err.message}`)
    throw err
  }
}

