const chai = require('chai')

const PlasmaMerkleSumTree = require('../../src/sum-tree/plasma-sum-tree')
const Transaction = require('../../src/serialization').models.Transaction
const txutils = require('../tx-utils')

const should = chai.should()

const accounts = [
  '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8'
]

const signature = {
  v: '1b',
  r: 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
  s: '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
}

const tx1 = new Transaction({
  transfers: [
    {
      sender: accounts[0],
      recipient: accounts[1],
      token: 0,
      start: 2,
      end: 3,
      block: 5
    }
  ],
  signatures: [signature]
})
const tx2 = new Transaction({
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 0,
      start: 6,
      end: 7,
      block: 5
    }
  ],
  signatures: [signature]
})
const tx3 = new Transaction({
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 1,
      start: 100,
      end: 108,
      block: 5
    }
  ],
  signatures: [signature]
})

describe('PlasmaMerkleSumTree', () => {
  it('should return undefined for an empty tree', () => {
    const tree = new PlasmaMerkleSumTree()

    should.not.exist(tree.root())
  })

  it('should generate a single-leaf tree correctly', () => {
    const tree = new PlasmaMerkleSumTree([tx1])

    tree.root().data.should.equal('563f225cdc192264a90e7e4b402815479c71a16f1593afa4fc6323e18583472a' + 'ffffffffffffffffffffffffffffffff')
  })

  it('should generate an even tree correctly', () => {
    const tree = new PlasmaMerkleSumTree([tx1, tx2])

    tree.root().data.should.equal('d4751f5dd74785e58aebfe9fd3e46519ee05527e1ac11209fa8190f20561c6cb' + 'ffffffffffffffffffffffffffffffff')
  })

  it('should generate an odd tree w/ multiple types correctly', function () {
    const tree = new PlasmaMerkleSumTree([tx1, tx2, tx3])
    tree.root().data.should.equal('e9dabef4e3b86cb540d587c04bee1f4e2d286cc8c61e5c77c0a1ca6da63810ad' + 'ffffffffffffffffffffffffffffffff')
  })

  describe('checkProof', () => {
    const txs = txutils.getSequentialTxs(100)
    const tree = new PlasmaMerkleSumTree(txs)
    const index = Math.floor(Math.random() * 100)
    const proof = tree.getInclusionProof(index)

    it('should verify a random proof', () => {
      const isValid = PlasmaMerkleSumTree.checkInclusion(index, txs[index], proof, tree.root())

      isValid.should.be.true
    })

    it('should not verify a proof with an invalid index', () => {
      const isValid = PlasmaMerkleSumTree.checkInclusion(index + 1, txs[index], proof, tree.root())

      isValid.should.be.false
    })

    it('should not verify a proof with an invalid element', () => {
      let invalidProof = tree.getInclusionProof(index)
      invalidProof.pop() // Remove an element
      const isValid = PlasmaMerkleSumTree.checkInclusion(index, txs[index], invalidProof, tree.root())

      isValid.should.be.false
    })
  })
})
