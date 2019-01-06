const Schema = require('../schema')
const Address = require('../schema-types/address')
const ByteArray = require('../schema-types/byte-array')

const TransferRecordSchema = new Schema({
  sender: {
    type: Address,
    required: true
  },
  recipient: {
    type: Address,
    required: true
  },
  token: {
    type: ByteArray,
    length: 4,
    required: true
  },
  start: {
    type: ByteArray,
    length: 12,
    required: true
  },
  end: {
    type: ByteArray,
    length: 12,
    required: true
  },
  block: {
    type: ByteArray,
    length: 32,
    required: true
  }
})

module.exports = TransferRecordSchema
