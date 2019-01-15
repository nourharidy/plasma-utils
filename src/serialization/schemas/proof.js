const Schema = require('../schema')
const Number = require('../schema-types/number')
const Bytes = require('../schema-types/bytes')
const Signature = require('./signature')

const InclusionProof = new Schema({
  branches: {
    type: [Bytes],
    length: 48
  }
})

const ProofSchema = new Schema({
  parsedSums: {
    type: [Number],
    length: 16
  },
  inclusionProofs: {
    type: [InclusionProof]
  },
  signatures: {
    type: [Signature]
  }
})

module.exports = ProofSchema
