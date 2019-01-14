const chai = require('chai')
const BN = require('web3').utils.BN

const MerkleSumTree = require('../../src/sum-tree/sum-tree')

const should = chai.should()

describe('MerkleSumTree', () => {
  it('should return undefined for an empty tree', () => {
    const tree = new MerkleSumTree()

    should.not.exist(tree.root())
  })

  it('should generate a single-leaf tree correctly', () => {
    const tree = new MerkleSumTree([
      {
        data: 'Hello',
        sum: 1
      }
    ])
    const root = tree.root()

    root.data.should.equal('06b3dfaec148fb1bb2b066f10ec285e7c9bf402ab32aa78a5d38e34566810cd2' + '00000000000000000000000000000001')
    root.sum.should.deep.equal(new BN(1))
  })
  it('should generate an even tree correctly', () => {
    const tree = new MerkleSumTree([
      {
        data: 'Hello',
        sum: 1
      },
      {
        data: 'World',
        sum: 2
      }
    ])
    const root = tree.root()

    root.data.should.equal('6bd541b4745da14453470d5f4d3599a706354199c742c35eb17e4738faa1c2a8' + '00000000000000000000000000000003')
    root.sum.should.deep.equal(new BN(3))
  })
  it('should generate an odd tree correctly', () => {
    const tree = new MerkleSumTree([
      {
        data: 'Hello',
        sum: 1
      },
      {
        data: 'World',
        sum: 2
      },
      {
        data: 'Works',
        sum: 3
      }
    ])
    const root = tree.root()

    root.data.should.equal('b6e37356622cb2200b5086a628339f78a2de407223c5b4cb1c69c850dbeff1ae' + '00000000000000000000000000000006')
    root.sum.should.deep.equal(new BN(6))
  })
})
