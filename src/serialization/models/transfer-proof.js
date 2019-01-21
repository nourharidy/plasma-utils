const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transfer proof.
 */
class TransferProof extends BaseModel {
  constructor (args) {
    super(args, schemas.TransferProofSchema)
  }
}

module.exports = TransferProof
