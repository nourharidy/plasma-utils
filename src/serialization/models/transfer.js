const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transfer record.
 */
class Transfer extends BaseModel {
  constructor (args) {
    super(args, schemas.TransferSchema)
  }
}

module.exports = Transfer
