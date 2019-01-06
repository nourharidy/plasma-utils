/* global describe it */
const assert = require('chai').assert

const PlasmaMerkleSumTree = require('../../src/sum-tree/plasma-sum-tree')
const Transaction = require('../../src/serialization').models.Transaction
const txutils = require('../tx-utils')

const signature = {
  v: '1b',
  r: 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
  s: '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
}
const tx1 = new Transaction({
  transfer: {
    sender: '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
    recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
    token: 0,
    start: 2,
    end: 3,
    block: 5
  },
  signature: signature
})
const tx2 = new Transaction({
  transfer: {
    sender: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
    recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f4',
    token: 0,
    start: 6,
    end: 7,
    block: 5
  },
  signature: signature
})
const tx3 = new Transaction({
  transfer: {
    sender: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
    recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f4',
    token: 1,
    start: 100,
    end: 108,
    block: 5
  },
  signature: signature
})

describe('PlasmaMerkleSumTree', () => {
  it('should return undefined for an empty tree', () => {
    const tree = new PlasmaMerkleSumTree()
    assert.strictEqual(tree.root(), undefined, 'root is undefined')
  })
  it('should generate a single-leaf tree correctly', () => {
    const tree = new PlasmaMerkleSumTree([tx1])
    const root = tree.root()
    assert.strictEqual(root.data, '7afd24f24623ffd54e4127920b594a1fc9595ac529a51eaaf29aad3de4f9109e' + 'ffffffffffffffffffffffffffffffff')
  })
  it('should generate an even tree correctly', () => {
    const tree = new PlasmaMerkleSumTree([tx1, tx2])
    const root = tree.root()
    assert.strictEqual(root.data, 'be785497466502d2923277d9db63004be63defc7146d408ff94a204963a19eaa' + 'ffffffffffffffffffffffffffffffff')
  })
  it('should generate an odd tree w/ multiple types correctly', function () {
    const tree = new PlasmaMerkleSumTree([tx1, tx2, tx3])
    const root = tree.root()
    assert.strictEqual(root.data, 'b3498ac522c72d090ef8bcbe4b50df59676fd9588f46a0139029039598d00617' + 'ffffffffffffffffffffffffffffffff')
  })
  it('should verify a random proof', () => {
    const txs = txutils.getSequentialTxs(100)
    const tree = new PlasmaMerkleSumTree(txs)
    const index = Math.floor(Math.random() * 100)
    const proof = tree.getBranch(index)
    const isValid = PlasmaMerkleSumTree.checkInclusion(index, txs[index], proof, tree.root())
    assert.isTrue(isValid)
  })
})
