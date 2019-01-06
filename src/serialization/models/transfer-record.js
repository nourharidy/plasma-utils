const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transfer record.
 */
class TransferRecord extends BaseModel {
  constructor (args) {
    super(args, schemas.TransferRecordSchema)
  }
}

module.exports = TransferRecord
