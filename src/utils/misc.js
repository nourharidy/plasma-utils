/**
 * Sleeps for a number of milliseconds.
 * @param {number} ms Number of ms to sleep.
 * @return {Promise} Promise that resolves after the number of ms.
 */
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Removes "0x" from start of a string if it exists.
 * @param {string} str String to modify.
 * @return {string} The string without "0x".
 */
const remove0x = (str) => {
  return str.startsWith('0x') ? str.slice(2) : str
}

/**
 * Adds "0x" to the start of a string if necessary.
 * @param {string} str String to modify.
 * @return {string} The string with "0x".
 */
const add0x = (str) => {
  return str.startsWith('0x') ? str : '0x' + str
}

/**
 * Checks if something is a string
 * @param {*} str Thing that might be a string.
 * @return {boolean} `true` if the thing is a string, `false` otherwise.
 */
const isString = (str) => {
  return str instanceof String || typeof str === 'string'
}

/**
 * Checks if something is an Object
 * @param {*} obj Thing that might be an Object.
 * @return {boolean} `true` if the thing is a Object, `false` otherwise.
 */
const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null
}

module.exports = {
  sleep,
  remove0x,
  add0x,
  isString,
  isObject
}
