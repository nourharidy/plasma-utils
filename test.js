const utils = require('./index')
const models = utils.serialization.models

const Transfer = models.Transfer
const transfer = new Transfer({
  token: 0,
  start: 0,
  end: 100,
  sender: '0x1E3a4a2edec2b3568B5Ad0656ec3b48d9C699dB6',
  recipient: '0x8508c8aCA521512D4695eCF6976d2e8D2666a46d'
})
console.log(transfer)

const UnsignedTransaction = models.UnsignedTransaction
const unsigned = new UnsignedTransaction({
  block: 123,
  transfers: [
    {
      token: 0,
      start: 0,
      end: 100,
      sender: '0x1E3a4a2edec2b3568B5Ad0656ec3b48d9C699dB6',
      recipient: '0x8508c8aCA521512D4695eCF6976d2e8D2666a46d'
    }
  ]
})
console.log(unsigned)

const Signature = models.Signature
const signature = new Signature({
  v: '0x1b',
  r: '0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
  s: '0x24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
})
console.log(signature)

const SignedTransaction = models.SignedTransaction
const signed = new SignedTransaction({
  block: 123,
  transfers: [
    {
      token: 0,
      start: 0,
      end: 100,
      sender: '0x1E3a4a2edec2b3568B5Ad0656ec3b48d9C699dB6',
      recipient: '0x8508c8aCA521512D4695eCF6976d2e8D2666a46d'
    }
  ],
  signatures: [
    {
      v: '0x1b',
      r: '0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
      s: '0x24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
    }
  ]
})
console.log(signed)
