import path from 'path'
import { fileURLToPath } from 'url'
import { ensureDir, writeFile, copy, pathExists, listFiles, readFile } from '../../utils/file.js'
import { getSiteYamlContent, getPackageJsonContent, getExampleMarkdownContent, getDefaultThemePaths } from '../../templates/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Initialize a new LightMark site
 * @param {string} targetDir - Target directory path
 */
export async function init(targetDir) {
  const absoluteDir = path.resolve(targetDir)

  // Check if directory exists and is not empty
  const exists = await pathExists(absoluteDir)
  if (exists) {
    const files = await listFiles(absoluteDir)
    if (files.length > 0) {
      throw new Error(`Directory "${absoluteDir}" is not empty`)
    }
  }

  // Create directory structure
  console.log(`Initializing LightMark site in ${absoluteDir}`)

  await ensureDir(path.join(absoluteDir, 'markdown'))
  await ensureDir(path.join(absoluteDir, 'themes', 'minimal', 'templates'))
  await ensureDir(path.join(absoluteDir, 'themes', 'minimal', 'assets'))

  // Create site.yaml
  await writeFile(
    path.join(absoluteDir, 'site.yaml'),
    getSiteYamlContent()
  )

  // Create package.json
  await writeFile(
    path.join(absoluteDir, 'package.json'),
    getPackageJsonContent()
  )

  // Create example markdown file
  await ensureDir(path.join(absoluteDir, 'markdown', 'getting-started'))
  await writeFile(
    path.join(absoluteDir, 'markdown', 'getting-started', '01-intro.md'),
    getExampleMarkdownContent()
  )

  // Copy theme from built-in minimal theme
  await copyBuiltinTheme(absoluteDir)

  console.log('LightMark site initialized successfully!')
  console.log(`
Next steps:
  cd ${targetDir}
  lightmark build
`)
}

/**
 * Copy built-in minimal theme to target directory
 * @param {string} targetDir - Target directory
 */
async function copyBuiltinTheme(targetDir) {
  // Get built-in theme directory (from package root)
  const builtinThemeDir = path.join(__dirname, '..', '..', '..', 'themes', 'minimal')

  // Check if built-in theme exists
  const exists = await pathExists(builtinThemeDir)
  if (!exists) {
    console.warn('Warning: Built-in theme not found, creating minimal theme from defaults...')
    await createMinimalThemeDefaults(targetDir)
    return
  }

  // Copy theme files
  const targetThemeDir = path.join(targetDir, 'themes', 'minimal')
  await copy(builtinThemeDir, targetThemeDir)
  console.log('Copied built-in minimal theme')
}

/**
 * Create minimal theme defaults when built-in theme is not available
 * @param {string} targetDir - Target directory
 */
async function createMinimalThemeDefaults(targetDir) {
  const themeDir = path.join(targetDir, 'themes', 'minimal')
  const defaults = getDefaultThemePaths()

  // Ensure directories exist
  await ensureDir(path.join(themeDir, 'templates'))
  await ensureDir(path.join(themeDir, 'assets', 'css'))

  // Copy all default theme files
  await writeFile(
    path.join(themeDir, 'theme.yaml'),
    await readFile(defaults.themeYaml)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'layout.html'),
    await readFile(defaults.layout)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'home.html'),
    await readFile(defaults.home)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'series.html'),
    await readFile(defaults.series)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'article.html'),
    await readFile(defaults.article)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'tags.html'),
    await readFile(defaults.tags)
  )
  await writeFile(
    path.join(themeDir, 'templates', 'tag.html'),
    await readFile(defaults.tag)
  )
  await writeFile(
    path.join(themeDir, 'assets', 'css', 'style.css'),
    await readFile(defaults.style)
  )
}

