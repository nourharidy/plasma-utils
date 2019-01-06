const BaseLogger = require('./base-logger')

/**
 * Logger that wraps the console.
 */
class ConsoleLogger extends BaseLogger {
  get name () {
    return 'base-logger'
  }

  log (message) {
    console.log(message)
  }
}

module.exports = ConsoleLogger
