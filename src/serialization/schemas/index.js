const SignatureSchema = require('./signature')
const TransferSchema = require('./transfer')
const UnsignedTransactionSchema = require('./transaction')
  .UnignedTransactionSchema
const SignedTransactionSchema = require('./transaction').SignedTransactionSchema
const ProofSchema = require('./proof')

module.exports = {
  SignatureSchema,
  TransferSchema,
  SignedTransactionSchema,
  UnsignedTransactionSchema,
  ProofSchema
}
