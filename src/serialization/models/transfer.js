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
        'hex',
        schemas.TransferSchema.fields.token.options.length * 2
      ) +
        this.start.toString(
          'hex',
          schemas.TransferSchema.fields.start.options.length * 2
        ),
      'hex'
    )
  }

  get typedEnd () {
    return new BN(
      this.token.toString(
        'hex',
        schemas.TransferSchema.fields.token.options.length * 2
      ) +
        this.end.toString(
          'hex',
          schemas.TransferSchema.fields.end.options.length * 2
        ),
      'hex'
    )
  }
}

module.exports = Transfer
