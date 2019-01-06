const Schema = require('../schema')
const TransferRecordSchema = require('./transfer-record')
const SignatureSchema = require('./signature')

const TransactionSchema = new Schema({
  transfer: {
    type: TransferRecordSchema
  },
  signature: {
    type: SignatureSchema
  }
})

module.exports = TransactionSchema
