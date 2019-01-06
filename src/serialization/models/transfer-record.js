const BaseModel = require('./base-model')
const schemas = require('../schemas')

class TransferRecord extends BaseModel {
  constructor (args) {
    super(args, schemas.TransferRecordSchema)
  }
}

module.exports = TransferRecord
