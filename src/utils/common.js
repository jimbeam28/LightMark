/**
 * Common utility functions shared across the codebase
 */

/**
 * Deep merge two objects
 * Recursively merges nested objects, with source values taking precedence.
 * Arrays are not merged but replaced entirely.
 *
 * @param {Object} target - Target object (base)
 * @param {Object} source - Source object (overrides)
 * @returns {Object} - Merged object
 */
export function deepMerge(target, source) {
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
