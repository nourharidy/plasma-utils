const Schema = require('../schema')
const Bytes = require('../schema-types/bytes')

const SignatureSchema = new Schema({
  r: {
    type: Bytes,
    length: 32,
    required: true
  },
  s: {
    type: Bytes,
    length: 32,
    required: true
  },
  v: {
    type: Bytes,
    length: 1,
    required: true
  }
})

module.exports = SignatureSchema
