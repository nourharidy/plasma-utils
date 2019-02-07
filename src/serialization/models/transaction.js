const web3Utils = require('../../utils/web3')
const BaseModel = require('./base-model')
const schemas = require('../schemas')

/**
 * Represents a transaction.
 */
class UnsignedTransaction extends BaseModel {
  constructor (args) {
    super(args, schemas.UnsignedTransactionSchema)
  }
}

/**
 * Represents a signed transaction.
 */
class SignedTransaction extends BaseModel {
  constructor (args) {
    super(args, schemas.SignedTransactionSchema)
  }

  get hash () {
    return new UnsignedTransaction(this).hash
  }

  /**
   * Checks if this transaction is correctly signed.
   * @return {boolean} `true` if the transaction is correctly signed, `false` otherwise.
   */
  checkSigs () {
    const unsigned = new UnsignedTransaction(this)
    return unsigned.transfers.every((transfer, i) => {
      const sig = this.signatures[i]
      const sigString =
        '0x' +
        sig.r.toString('hex') +
        sig.s.toString('hex') +
        sig.v.toString('hex')
      const signer = web3Utils.recover(unsigned.hash, sigString)
      return signer === transfer.sender
    })
  }
}

module.exports = {
  UnsignedTransaction,
  SignedTransaction
}
