const Schema = require('../schema')
const ByteArray = require('../schema-types/byte-array')

const SignatureSchema = new Schema({
  v: {
    type: ByteArray,
    length: 1,
    required: true
  },
  r: {
    type: ByteArray,
    length: 32,
    required: true
  },
  s: {
    type: ByteArray,
    length: 32,
    required: true
  }
})

module.exports = SignatureSchema
