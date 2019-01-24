const BigNum = require('bn.js')
const Web3 = require('web3')
const models = require('./serialization').models
const accounts = require('./constants').ACCOUNTS
const Signature = models.Signature
const UnsignedTransaction = models.UnsignedTransaction
const SignedTransaction = models.SignedTransaction
const web3 = new Web3()

const int32ToHex = (x) => {
  x &= 0xffffffff
  let hex = x.toString(16).toUpperCase()
  return ('0000000000000000' + hex).slice(-16)
}

const getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const getRandomAccount = () => {
  return getRandomElement(accounts)
}

const sign = (data, key) => {
  return web3.eth.accounts.sign(data, key)
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Removes "0x" from start of a string if it exists.
 * @param {string} str String to modify.
 * @return {string} The string without "0x".
 */
const remove0x = (str) => {
  return str.startsWith('0x') ? str.slice(2) : str
}

/**
 * Adds "0x" to the start of a string if necessary.
 * @param {string} str String to modify.
 * @return {string} The string with "0x".
 */
const add0x = (str) => {
  return str.startsWith('0x') ? str : '0x' + str
}

/**
 * Checks if something is a string
 * @param {*} str Thing that might be a string.
 * @return {boolean} `true` if the thing is a string, `false` otherwise.
 */
const isString = (str) => {
  return str instanceof String || typeof str === 'string'
}

/**
 * Converts a signature object into a string.
 * @param {Object} signature A signature object with v,r,s buffers.
 * @return {string} Signature as a hex string.
 */
const signatureToString = (signature) => {
  if (isString(signature)) {
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
  if (!isString(signature)) {
    return signature
  }
  signature = remove0x(signature)
  return new Signature({
    r: Buffer.from(signature.slice(0, 64), 'hex'),
    s: Buffer.from(signature.slice(64, 128), 'hex'),
    v: Buffer.from(signature.slice(128, 132), 'hex')
  })
}

/**
 * Returns a list of `n` sequential transactions.
 * @param {*} n Number of sequential transactions to return.
 * @return {*} A list of sequential transactions.
 */
const getSequentialTxs = (n) => {
  let txs = []

  for (let i = 0; i < n; i++) {
    let sender = getRandomAccount()
    let recipient = getRandomAccount()

    let unsignedTx = new UnsignedTransaction({
      block: 0,
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
 * @param {*} n Number of sequential transactions to return.
 * @return {*} A list of sequential transactions.
 */

function genRandomTX (blockNum, senderAddress, recipientAddress, numTransfers) {
  let randomTransfers = []
  for (let i = 0; i < numTransfers; i++) {
    // fuzz a random encoding to test decoding with
    let randomVals = ''
    for (let i = 0; i < 28; i++) {
      // random start, end, type = 12+12+4 bytes
      const randHex = Math.floor(Math.random() * 256)
      randomVals += new BigNum(randHex, 10).toString(16, 2)
    }
    randomTransfers +=
      senderAddress.slice(2) + recipientAddress.slice(2) + randomVals
    // can't have invalid addresses so ignore this partthe 33rd byte is the numTransfers which isn't random--it's 4
  }
  return (
    new BigNum(blockNum).toString(16, 8) +
    new BigNum(numTransfers).toString(16, 2) +
    randomTransfers
  )
}

module.exports = {
  int32ToHex,
  getSequentialTxs,
  genRandomTX,
  sleep,
  remove0x,
  add0x,
  isString,
  signatureToString,
  stringToSignature
}
