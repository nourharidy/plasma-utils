/* eslint-disable no-new */
const assert = require('chai').assert
const models = require('../../src/serialization').models
const TransferRecord = models.TransferRecord
const Signature = models.Signature
const Transaction = models.Transaction

const encodedTransferRecord = '43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5a12bcf1159aa01c739269391ae2d0be4037259f3000000010000000000000000000000020000000000000000000000030000000000000000000000000000000000000000000000000000000000000004'
const decodedTransferRecord = {
  sender: '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  token: 1,
  start: 2,
  end: 3,
  block: 4
}

const encodedSignature = '1bd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c04224e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
const decodedSignature = {
  v: '1b',
  r: 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
  s: '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
}

const encodedTransaction = encodedTransferRecord + encodedSignature
const decodedTransaction = {
  transfer: decodedTransferRecord,
  signature: decodedSignature
}

describe('Serialization', () => {
  it('should correctly encode a TransferRecord', () => {
    const tr = new TransferRecord(decodedTransferRecord)
    assert.strictEqual(encodedTransferRecord, tr.encoded, 'transfer was encoded correctly')
  })
  it('should correctly decode a TransferRecord', () => {
    const tr = new TransferRecord(encodedTransferRecord)
    assert.deepEqual(decodedTransferRecord, tr.decoded, 'transfer was decoded correctly')
  })
  it('should correctly encode a Signature', () => {
    const sig = new Signature(decodedSignature)
    assert.strictEqual(encodedSignature, sig.encoded, 'signature was encoded correctly')
  })
  it('should correctly decode a Signature', () => {
    const sig = new Signature(encodedSignature)
    assert.deepEqual(decodedSignature, sig.decoded, 'signature was decoded correctly')
  })
  it('should correctly encode a Transaction', () => {
    const tx = new Transaction(decodedTransaction)
    assert.strictEqual(encodedTransaction, tx.encoded, 'transaction was encoded correctly')
  })
  it('should correctly decode a Transaction', () => {
    const tx = new Transaction(encodedTransaction)
    assert.deepEqual(decodedTransaction, tx.decoded, 'transaction was decoded correctly')
  })
  it('should throw if trying to create a TransferRecord with an invalid address', () => {
    assert.throws(() => {
      new TransferRecord({
        ...decodedTransferRecord,
        ...{ sender: 'This is not a valid Ethereum address' }
      })
    }, 'Address must be a valid Ethereum address', 'error was thrown')
  })
  it('should throw if trying to create a TransferRecord with an invalid integer parameter', () => {
    assert.throws(() => {
      new TransferRecord({
        ...decodedTransferRecord,
        ...{ token: 99999999999 }
      })
    }, 'Invalid ByteArray length', 'error was thrown')
  })
  it('should throw if trying to create a Signature with an invalid parameter', () => {
    assert.throws(() => {
      new Signature({
        ...decodedSignature,
        ...{ v: 'deadbeef' }
      })
    }, 'Invalid ByteArray length', 'error was thrown')
  })
})
