const Schema = require('../schema')
const TransferSchema = require('./transfer')
const SignatureSchema = require('./signature')

const TransactionSchema = new Schema({
  transfers: {
    type: [TransferSchema]
  },
  signatures: {
    type: [SignatureSchema]
  }
})

module.exports = TransactionSchema
