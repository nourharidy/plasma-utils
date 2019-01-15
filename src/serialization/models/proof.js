const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transaction.
 */
class Proof extends BaseModel {
  constructor (args) {
    super(args, schemas.ProofSchema)
  }
}

module.exports = Proof
