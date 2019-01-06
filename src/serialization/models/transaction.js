const BaseModel = require('./base-model')
const schemas = require('../schemas')

class Transaction extends BaseModel {
  constructor (args) {
    super(args, schemas.TransactionSchema)
  }
}

module.exports = Transaction
