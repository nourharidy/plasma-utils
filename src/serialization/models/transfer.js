const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transfer record.
 */
class Transfer extends BaseModel {
  constructor (args) {
    super(args, schemas.TransferSchema)
  }

  get typedStart () {
    return this.start.add(this.token)
  }

  get typedEnd () {
    return this.end.add(this.token)
  }
}

module.exports = Transfer
