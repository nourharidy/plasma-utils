const BaseModel = require('./base-model')
const schemas = require('../schemas')
const Transfer = require('./transfer')

/**
 * Represents a transaction.
 */
class UnsignedTransaction extends BaseModel {
  constructor (args) {
    super(args, schemas.UnsignedTransactionSchema)
    this.transfers = this.args.transfers.map((transfer) => {
      return new Transfer(transfer)
    })
  }
}

/**
 * Represents a signed transaction.
 */
class SignedTransaction extends BaseModel {
  constructor (args) {
    super(args, schemas.SignedTransactionSchema)
    this.transfers = this.args.transfers.map((transfer) => {
      return new Transfer(transfer)
    })
  }
}

module.exports = {
  UnsignedTransaction,
  SignedTransaction
}
