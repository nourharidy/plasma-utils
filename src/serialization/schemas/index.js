const SignatureSchema = require('./signature')
const TransferSchema = require('./transfer')
const UnsignedTransactionSchema = require('./transaction')
  .UnsignedTransactionSchema
const SignedTransactionSchema = require('./transaction').SignedTransactionSchema
const TransferProofSchema = require('./transfer-proof')
const TransactionProofSchema = require('./transaction-proof')

module.exports = {
  SignatureSchema,
  TransferSchema,
  SignedTransactionSchema,
  UnsignedTransactionSchema,
  TransferProofSchema,
  TransactionProofSchema
}
