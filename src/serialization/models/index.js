const Signature = require('./signature')
const Transfer = require('./transfer')
const SignedTransaction = require('./transaction').SignedTransaction
const UnsignedTransaction = require('./transaction').UnsignedTransaction
const Transaction = UnsignedTransaction // TODO: Remove this
const TransferProof = require('./transfer-proof')
const TransactionProof = require('./transaction-proof')

module.exports = {
  Signature,
  Transfer,
  Transaction,
  SignedTransaction,
  UnsignedTransaction,
  TransferProof,
  TransactionProof
}
