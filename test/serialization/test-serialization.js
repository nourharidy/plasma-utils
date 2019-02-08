/* eslint-disable no-new */
const chai = require('chai')
const BigNum = require('bn.js')

const models = require('../../src/serialization').models
const Transfer = models.Transfer
const Signature = models.Signature
const UnsignedTransaction = models.UnsignedTransaction
const SignedTransaction = models.SignedTransaction
const TransactionProof = models.TransactionProof
const TransferProof = models.TransferProof

const should = chai.should()

const encodedTransfer = '43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5a12bCf1159Aa01C739269391AE2d0BE4037259f300000001000000000000000000000002000000000000000000000003'
const decodedTransfer = {
  sender: '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  recipient: '0xa12bCf1159Aa01C739269391AE2d0BE4037259f3',
  token: new BigNum('1', 'hex'),
  start: new BigNum('2', 'hex'),
  end: new BigNum('3', 'hex')
}

const ethereumSignature = '0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c04224e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b3541b'
const encodedSignature = 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c04224e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b3541b'
const decodedSignature = {
  v: Buffer.from('1b', 'hex'),
  r: Buffer.from('d693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042', 'hex'),
  s: Buffer.from('24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354', 'hex')
}

const encodedUnsignedTransaction = '00000001' + '01' + encodedTransfer
const decodedUnsignedTransaction = {
  block: new BigNum('1', 'hex'),
  transfers: [
    decodedTransfer
  ]
}

const encodedSignedTransaction = encodedUnsignedTransaction + '01' + encodedSignature
const decodedSignedTransaction = {
  block: new BigNum('1', 'hex'),
  transfers: [
    decodedTransfer
  ],
  signatures: [
    decodedSignature
  ]
}

const encodedTransferProof = '00000000000000000000000000000003' + '00000000000000000000000000000004' + encodedSignature + '01' + '563f225cdc192264a90e7e4b402815479c71a16f1593afa4fc6323e18583472affffffffffffffffffffffffffffffff'
const decodedTransferProof = {
  parsedSum: new BigNum('3', 'hex'),
  leafIndex: new BigNum('4', 'hex'),
  inclusionProof: [
    Buffer.from('563f225cdc192264a90e7e4b402815479c71a16f1593afa4fc6323e18583472affffffffffffffffffffffffffffffff', 'hex')
  ],
  signature: decodedSignature
}

const encodedTransactionProof = '01' + encodedTransferProof
const decodedTransactionProof = {
  transferProofs: [
    decodedTransferProof
  ]
}

describe('Serialization', () => {
  describe('Transfer', () => {
    it('should be correctly encoded', () => {
      const tr = new Transfer(decodedTransfer)

      tr.encoded.should.equal(encodedTransfer)
    })

    it('should be correctly decoded', () => {
      const tr = new Transfer(encodedTransfer)

      tr.decoded.should.deep.equal(decodedTransfer)
    })

    it('should be correctly decoded with a buffer input', () => {
      const tr = new Transfer(Buffer.from(encodedTransfer, 'hex'))

      tr.decoded.should.deep.equal(decodedTransfer)
    })

    it('should throw if trying to create a Transfer with an invalid address', () => {
      should.Throw(() => {
        new Transfer({
          ...decodedTransfer,
          ...{ sender: 'This is not a valid Ethereum address' }
        })
      }, 'Address must be a valid Ethereum address')
    })

    it('should throw if trying to create a Transfer with an invalid integer parameter', () => {
      should.Throw(() => {
        new Transfer({
          ...decodedTransfer,
          ...{ token: 99999999999 }
        })
      }, 'Number is too large')
    })
  })

  describe('Signature', () => {
    it('should be correctly encoded', () => {
      const sig = new Signature(decodedSignature)

      sig.encoded.should.equal(encodedSignature)
    })

    it('should be correctly decoded', () => {
      const sig = new Signature(encodedSignature)

      sig.decoded.should.deep.equal(decodedSignature)
    })

    it('should work from an Ethereum signature', () => {
      const sig = new Signature(ethereumSignature)

      sig.decoded.should.deep.equal(decodedSignature)
    })

    it('should throw if trying to create a Signature with an invalid parameter', () => {
      should.Throw(() => {
        new Signature({
          ...decodedSignature,
          ...{ v: 'deadbeef' }
        })
      }, 'Invalid Buffer length')
    })
  })

  describe('UnsignedTransaction', () => {
    it('should be correctly encoded', () => {
      const tx = new UnsignedTransaction(decodedUnsignedTransaction)

      tx.encoded.should.equal(encodedUnsignedTransaction)
    })

    it('should be correctly decoded', () => {
      const tx = new UnsignedTransaction(encodedUnsignedTransaction)

      tx.decoded.should.deep.equal(decodedUnsignedTransaction)
    })

    it('should be correctly copied', () => {
      const tx1 = new UnsignedTransaction(encodedUnsignedTransaction)
      const tx2 = new UnsignedTransaction(tx1)

      tx2.decoded.should.deep.equal(tx1.decoded)
    })

    it('should be correctly modified', () => {
      let tx = new UnsignedTransaction(encodedUnsignedTransaction)
      tx.block = new BigNum(2)
      const expected = '00000002' + '01' + encodedTransfer

      tx.encoded.should.deep.equal(expected)
    })
  })

  describe('SignedTransaction', () => {
    it('should be correctly encoded', () => {
      const tx = new SignedTransaction(decodedSignedTransaction)

      tx.encoded.should.equal(encodedSignedTransaction)
    })

    it('should be correctly decoded', () => {
      const tx = new SignedTransaction(encodedSignedTransaction)

      tx.decoded.should.deep.equal(decodedSignedTransaction)
    })

    it('should be correctly decoded with mixed inputs', () => {
      const mixed = {
        ...decodedSignedTransaction,
        ...{ signatures: [ ethereumSignature ] }
      }
      const tx = new SignedTransaction(mixed)

      tx.decoded.should.deep.equal(decodedSignedTransaction)
    })
  })

  describe('TransferProof', () => {
    it('should be correctly encoded', () => {
      const proof = new TransferProof(decodedTransferProof)

      proof.encoded.should.equal(encodedTransferProof)
    })

    it('should be correctly decoded', () => {
      const proof = new TransferProof(encodedTransferProof)

      proof.decoded.should.deep.equal(decodedTransferProof)
    })
  })

  describe('TransactionProof', () => {
    it('should be correctly encoded', () => {
      const proof = new TransactionProof(decodedTransactionProof)

      proof.encoded.should.equal(encodedTransactionProof)
    })

    it('should be correctly decoded', () => {
      const proof = new TransactionProof(encodedTransactionProof)

      proof.decoded.should.deep.equal(decodedTransactionProof)
    })
  })
})
