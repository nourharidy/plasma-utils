const Schema = require('../schema')
const Number = require('../schema-types/number')
const TransferSchema = require('./transfer')
const SignatureSchema = require('./signature')

const SignedTransactionSchema = new Schema({
  block: {
    type: Number,
    length: 4,
    required: true
  },
  transfers: {
    type: [TransferSchema]
  },
  signatures: {
    type: [SignatureSchema]
  }
})

const UnsignedTransactionSchema = new Schema({
  block: {
    type: Number,
    length: 4,
    required: true
  },
  transfers: {
    type: [TransferSchema]
  }
})

module.exports = {
  SignedTransactionSchema,
  UnsignedTransactionSchema
}
