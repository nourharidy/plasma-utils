const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transaction proof.
 */
class TransactionProof extends BaseModel {
  constructor (args) {
    super(args, schemas.TransactionProofSchema)
  }
}

module.exports = TransactionProof
