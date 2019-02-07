const BigNum = require('bn.js')
const miscUtils = require('./misc')
const web3Utils = require('./web3')
const models = require('../serialization').models
const accounts = require('../constants').ACCOUNTS
const Signature = models.Signature
const Transfer = models.Transfer
const UnsignedTransaction = models.UnsignedTransaction
const SignedTransaction = models.SignedTransaction

/**
 * Converts an int32 to a hex string.
 * @param {number} x int32 to convert.
 * @return {string} The hex string.
 */
const int32ToHex = (x) => {
  x &= 0xffffffff
  let hex = x.toString(16).toUpperCase()
  return ('0000000000000000' + hex).slice(-16)
}

/**
 * Returns a random element from an array.
 * @param {Array} arr An array.
 * @return {*} An element from the array.
 */
const getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Returns a random account.
 * @return {*} An account.
 */
const getRandomAccount = () => {
  return getRandomElement(accounts)
}

/**
 * Signs a message with a private key.
 * @param {string} data Message to sign.
 * @param {string} key The private key.
 * @return {string} The signature.
 */
const sign = (data, key) => {
  return web3Utils.sign(data, key)
}

/**
 * Converts a signature object into a string.
 * @param {Object} signature A signature object with v,r,s buffers.
 * @return {string} Signature as a hex string.
 */
const signatureToString = (signature) => {
  if (miscUtils.isString(signature)) {
    return signature
  }
  return (
    '0x' +
    signature.r.toString('hex') +
    signature.s.toString('hex') +
    signature.v.toString('hex')
  )
}

/**
 * Converts a string into a signature object.
 * @param {string} signature A signature string.
 * @return {Object} A signature object with v,r,s.
 */
const stringToSignature = (signature) => {
  if (!miscUtils.isString(signature)) {
    return signature
  }
  signature = miscUtils.remove0x(signature)
  return new Signature({
    r: Buffer.from(signature.slice(0, 64), 'hex'),
    s: Buffer.from(signature.slice(64, 128), 'hex'),
    v: Buffer.from(signature.slice(128, 132), 'hex')
  })
}

/**
 * Returns a list of `n` sequential transactions.
 * @param {number} n Number of sequential transactions to return.
 * @param {number} blockNum Block number for the transactions.
 * @return {Array<SignedTransaction>} A list of sequential transactions.
 */
const getSequentialTxs = (n, blockNum) => {
  let txs = []

  for (let i = 0; i < n; i++) {
    let sender = getRandomAccount()
    let recipient = getRandomAccount()

    let unsignedTx = new UnsignedTransaction({
      block: blockNum,
      transfers: [
        {
          sender: sender.address,
          recipient: recipient.address,
          token: 0,
          start: i * 10,
          end: (i + 1) * 10
        }
      ]
    })
    let signedTx = new SignedTransaction({
      ...unsignedTx,
      ...{ signatures: [sign(unsignedTx.hash, sender.key)] }
    })
    txs.push(signedTx)
  }

  return txs
}

/**
 * Returns a transaction generated from a fuzzed encoding.
 * @param {number} blockNum Block in which the tx will be included.
 * @param {string} sender Address of the sender.
 * @param {string} recipient Address of the recipient.
 * @param {number} numTransfers Number of transfers in the transaction.
 * @return {UnsignedTransaction} The generated transaction.
 */
function getRandomTx (blockNum, sender, recipient, numTransfers) {
  let transfers = []
  for (let i = 0; i < numTransfers; i++) {
    let randomVals = ''
    for (let i = 0; i < 28; i++) {
      // random start, end, type = 12+12+4 bytes
      const randHex = Math.floor(Math.random() * 256)
      randomVals += new BigNum(randHex, 10).toString(16, 2)
    }

    transfers.push(
      new Transfer({
        start: randomVals.slice(0, 12),
        end: randomVals.slice(12, 24),
        token: randomVals.slice(24, 28),
        sender: sender,
        recipient: recipient
      })
    )
  }

  return new UnsignedTransaction({
    block: blockNum,
    transfers: transfers
  })
}

module.exports = {
  int32ToHex,
  getSequentialTxs,
  getRandomTx,
  web3Utils,
  signatureToString,
  stringToSignature,
  sign
}
