const chai = require('chai')
const BigNum = require('bn.js')

const PlasmaMerkleSumTree = require('../../src/sum-tree/plasma-sum-tree')
const models = require('../../src/serialization').models
const UnsignedTransaction = models.UnsignedTransaction
const utils = require('../../src/utils')

const should = chai.should()

const accounts = [
  '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8'
]

const tx1 = new UnsignedTransaction({
  block: 0,
  transfers: [
    {
      sender: accounts[0],
      recipient: accounts[1],
      token: 0,
      start: 2,
      end: 3
    }
  ]
})
const tx2 = new UnsignedTransaction({
  block: 0,
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 0,
      start: 6,
      end: 7
    }
  ]
})
const tx3 = new UnsignedTransaction({
  block: 0,
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 1,
      start: 100,
      end: 108
    }
  ]
})

describe('PlasmaMerkleSumTree', () => {
  describe('construction', () => {
    it('should return undefined for an empty tree', () => {
      const tree = new PlasmaMerkleSumTree()

      should.not.exist(tree.root())
    })

    it('should generate a single-leaf tree correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1])

      tree.root().data.should.equal('1b2e79791f28c27ed669f257397e1deb3e522cf1f27024c161b619d276a25315' + 'ffffffffffffffffffffffffffffffff')
    })

    it('should generate an even tree correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1, tx2])

      tree.root().data.should.equal('7aaef6ea48e7c8cbbcd8d65cecc3af23f851474ad8c558c4d0406323bd2ef2d8' + 'ffffffffffffffffffffffffffffffff')
    })

    it('should generate an odd tree w/ multiple types correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1, tx2, tx3])
      tree.root().data.should.equal('aa424a2e56b315ee500eaa90ca12116667d863c9d6548ab00319d2519289d5eb' + 'ffffffffffffffffffffffffffffffff')
    })
  })

  describe('Proof Checking', () => {
    const numDummyTransactions = 100
    const blockNum = 1
    const txs = utils.getSequentialTxs(numDummyTransactions, blockNum)
    const tree = new PlasmaMerkleSumTree(txs)
    const index = Math.floor(Math.random() * numDummyTransactions)
    const tx = tree.leaves[index]

    // TODO: Have this run with specific indices, not random.
    it('should verify a random TransferProof', () => {
      const TRIndex = 0

      const transferProof = tree.getTransferProof(index, TRIndex)

      const isValid = PlasmaMerkleSumTree.checkTransferProof(tx, TRIndex, transferProof, tree.root().data)
      isValid.should.be.true
    })

    it('should should not verify a TransferProof with an invalid index', () => {
      const TRIndex = 0

      const transferProof = tree.getTransferProof(index, TRIndex)
      transferProof.leafIndex += 1

      const isValid = PlasmaMerkleSumTree.checkTransferProof(tx, TRIndex, transferProof, tree.root().data)
      isValid.should.be.false
    })

    it('shoudld getTransferProofBounds', () => {
      const TRIndex = 0

      const firstTx = tree.leaves[0]
      const transferProof = tree.getTransferProof(0, TRIndex)

      const proofBounds = PlasmaMerkleSumTree.getTransferProofBounds(firstTx, transferProof)

      const expected = {
        implicitStart: new BigNum('0', 'hex'),
        implicitEnd: new BigNum('a', 'hex')
      }
      proofBounds.should.deep.equal(expected)
    })

    it('should verify a random TransactionProof', () => {
      const transactionProof = tree.getTransactionProof(tx)

      const isValid = PlasmaMerkleSumTree.checkTransactionProof(tx, transactionProof, tree.root().data)
      isValid.should.be.true
    })
    it('should should not verify a TransactionProof with an invalid index', () => {
      const transactionProof = tree.getTransactionProof(tx)
      transactionProof.transferProofs[0].leafIndex += 1

      const isValid = PlasmaMerkleSumTree.checkTransactionProof(tx, transactionProof, tree.root().data)
      isValid.should.be.false
    })
  })
})
