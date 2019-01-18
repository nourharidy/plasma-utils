const Signature = require('./signature')
const Transfer = require('./transfer')
const SignedTransaction = require('./transaction').SignedTransaction
const UnsignedTransaction = require('./transaction').UnsignedTransaction
const Transaction = UnsignedTransaction // TODO: Remove this
const Proof = require('./proof')

module.exports = {
  Signature,
  Transfer,
  Transaction,
  SignedTransaction,
  UnsignedTransaction,
  Proof
}
