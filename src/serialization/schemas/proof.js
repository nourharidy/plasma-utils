const Schema = require('../schema')
const Number = require('../schema-types/number')
const Bytes = require('../schema-types/bytes')
const SignatureSchema = require('./signature')

const TransferProofSchema = new Schema({
  parsedSum: {
    type: Number,
    length: 16
  },
  leafIndex: {
    type: Number,
    length: 16
  },
  inclusionProof: {
    type: [Bytes],
    length: 48
  },
  signature: {
    type: SignatureSchema
  }
})

const TransactionProofSchema = new Schema({
  transferProofs: {
    type: [TransferProofSchema]
  }
})

module.exports = TransactionProofSchema
