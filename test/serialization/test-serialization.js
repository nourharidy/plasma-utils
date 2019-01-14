/* eslint-disable no-new */
const assert = require('chai').assert
const BigNum = require('bn.js')

const models = require('../../src/serialization').models
const Transfer = models.Transfer
const Signature = models.Signature
const Transaction = models.Transaction

const encodedTransfer = '43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5a12bcf1159aa01c739269391ae2d0be4037259f3000000010000000000000000000000020000000000000000000000030000000000000000000000000000000000000000000000000000000000000004'
const decodedTransfer = {
  sender: '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  token: new BigNum('1', 'hex'),
  start: new BigNum('2', 'hex'),
  end: new BigNum('3', 'hex'),
  block: new BigNum('4', 'hex')
}

const encodedSignature = '1bd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c04224e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
const decodedSignature = {
  v: '1b',
  r: 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
  s: '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
}

const encodedTransaction = '01' + encodedTransfer + '01' + encodedSignature
const decodedTransaction = {
  transfers: [
    decodedTransfer
  ],
  signatures: [
    decodedSignature
  ]
}

describe('Serialization', () => {
  describe('Transfer', () => {
    it('should be correctly encoded', () => {
      const tr = new Transfer(decodedTransfer)
      assert.strictEqual(encodedTransfer, tr.encoded, 'transfer was encoded correctly')
    })

    it('should be correctly decoded', () => {
      const tr = new Transfer(encodedTransfer)
      assert.deepEqual(decodedTransfer, tr.decoded, 'transfer was decoded correctly')
    })

    it('should throw if trying to create a Transfer with an invalid address', () => {
      assert.throws(() => {
        new Transfer({
          ...decodedTransfer,
          ...{ sender: 'This is not a valid Ethereum address' }
        })
      }, 'Address must be a valid Ethereum address', 'error was thrown')
    })

    it('should throw if trying to create a Transfer with an invalid integer parameter', () => {
      assert.throws(() => {
        new Transfer({
          ...decodedTransfer,
          ...{ token: 99999999999 }
        })
      }, 'Number is too large', 'error was thrown')
    })
  })

  describe('Signature', () => {
    it('should be correctly encoded', () => {
      const sig = new Signature(decodedSignature)
      assert.strictEqual(encodedSignature, sig.encoded, 'signature was encoded correctly')
    })

    it('should be correctly decoded', () => {
      const sig = new Signature(encodedSignature)
      assert.deepEqual(decodedSignature, sig.decoded, 'signature was decoded correctly')
    })

    it('should throw if trying to create a Signature with an invalid parameter', () => {
      assert.throws(() => {
        new Signature({
          ...decodedSignature,
          ...{ v: 'deadbeef' }
        })
      }, 'Invalid Buffer length', 'error was thrown')
    })
  })

  describe('Transaction', () => {
    it('should be correctly encoded', () => {
      const tx = new Transaction(decodedTransaction)
      assert.strictEqual(encodedTransaction, tx.encoded, 'transaction was encoded correctly')
    })

    it('should be correctly decoded', () => {
      const tx = new Transaction(encodedTransaction)
      assert.deepEqual(decodedTransaction, tx.decoded, 'transaction was decoded correctly')
    })
  })
})
