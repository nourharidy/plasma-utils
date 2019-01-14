const BaseModel = require('./base-model')
const schemas = require('../schemas')
const Transfer = require('./transfer')

/**
 * Represents a transaction.
 */
class Transaction extends BaseModel {
  constructor (args) {
    super(args, schemas.TransactionSchema)
    this.transfers = this.args.transfers.map((transfer) => {
      return new Transfer(transfer)
    })
  }
}

module.exports = Transaction
