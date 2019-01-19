const BN = require('bn.js')
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
    return new BN(
      this.token.toString(
        16,
        schemas.TransferSchema.fields.token.options.length * 2
      ) +
        this.start.toString(
          16,
          schemas.TransferSchema.fields.start.options.length * 2
        )
    )
  }

  get typedEnd () {
    return new BN(
      this.token.toString(
        16,
        schemas.TransferSchema.fields.token.options.length * 2
      ) +
        this.end.toString(
          16,
          schemas.TransferSchema.fields.end.options.length * 2
        )
    )
  }
}

module.exports = Transfer
