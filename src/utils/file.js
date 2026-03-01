import fse from 'fs-extra'
import path from 'path'

/**
 * Ensure a directory exists, create if not
 * @param {string} dir - Directory path
 */
export async function ensureDir(dir) {
  await fse.ensureDir(dir)
}

/**
 * Read file content
 * @param {string} filePath - File path
 * @returns {Promise<string>} - File content
 */
export async function readFile(filePath) {
  return await fse.readFile(filePath, 'utf-8')
}

/**
 * Write content to file
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 */
export async function writeFile(filePath, content) {
  await fse.ensureDir(path.dirname(filePath))
  await fse.writeFile(filePath, content)
}

/**
 * Write JSON to file
 * @param {string} filePath - File path
 * @param {any} data - Data to serialize
 */
export async function writeJSON(filePath, data) {
  await fse.ensureDir(path.dirname(filePath))
  await fse.writeJSON(filePath, data, { spaces: 2 })
}

/**
 * Copy a file or directory
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
export async function copy(src, dest) {
  await fse.copy(src, dest)
}

/**
 * Remove a file or directory
 * @param {string} target - Target path
 */
export async function remove(target) {
  await fse.remove(target)
}

/**
 * Check if path exists
 * @param {string} target - Target path
 * @returns {Promise<boolean>}
 */
export async function pathExists(target) {
  return await fse.pathExists(target)
}

/**
 * List files in a directory (non-recursive)
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>} - File names
 */
export async function listFiles(dir) {
  const exists = await fse.pathExists(dir)
  if (!exists) return []
  return await fse.readdir(dir)
}

/**
 * List markdown files in a directory (recursively)
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>} - Absolute file paths
 */
export async function listMarkdownFiles(dir) {
  const exists = await fse.pathExists(dir)
  if (!exists) return []

  const files = []
  const items = await fse.readdir(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      const subFiles = await listMarkdownFiles(fullPath)
      files.push(...subFiles)
    } else if (item.isFile() && item.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Get directories in a directory (non-recursive)
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>} - Directory names
 */
export async function listDirectories(dir) {
  const exists = await fse.pathExists(dir)
  if (!exists) return []

  const dirs = []
  const items = await fse.readdir(dir, { withFileTypes: true })

  for (const item of items) {
    if (item.isDirectory()) {
      dirs.push(item.name)
    }
  }

  return dirs
}

/**
 * Generate slug from filename
 * @param {string} filename - Filename (without extension)
 * @returns {string} - Slug
 */
export function generateSlug(filename) {
  // Remove leading numbers and hyphen (e.g., "01-intro" -> "intro")
  const slug = filename.replace(/^\d+[-_]?/, '')
  return slug || filename
}

/**
 * Parse order from filename
 * @param {string} filename - Filename (without extension)
 * @returns {number} - Order number (defaults to 999)
 */
export function parseOrder(filename) {
  const match = filename.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 999
}