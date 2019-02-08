const Schema = require('../schema')
const Number = require('../schema-types/number')
const Bytes = require('../schema-types/buffer')
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
  signature: {
    type: SignatureSchema
  },
  inclusionProof: {
    type: [Bytes],
    length: 48
  }
})

module.exports = TransferProofSchema
