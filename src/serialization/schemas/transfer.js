const Schema = require('../schema')
const Address = require('../schema-types/address')
const Number = require('../schema-types/number')

const TransferSchema = new Schema({
  sender: {
    type: Address,
    required: true
  },
  recipient: {
    type: Address,
    required: true
  },
  token: {
    type: Number,
    length: 4,
    required: true
  },
  start: {
    type: Number,
    length: 12,
    required: true
  },
  end: {
    type: Number,
    length: 12,
    required: true
  }
})

module.exports = TransferSchema
