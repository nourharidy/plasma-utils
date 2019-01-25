const chai = require('chai')
const BN = require('bn.js')

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
        data: 'dead',
        sum: 1
      }
    ])
    const root = tree.root()

    root.data.should.equal('3905d344717efd562447a4960eea941c1244adc31f53525d0ec1397ff6951c9c' + '00000000000000000000000000000001')
    root.sum.toString('hex').should.equal(new BN(1).toString('hex'))
  })
  it('should generate an even tree correctly', () => {
    const tree = new MerkleSumTree([
      {
        data: 'dead',
        sum: 1
      },
      {
        data: 'beef',
        sum: 2
      }
    ])
    const root = tree.root()

    root.data.should.equal('01a7a83937ac55285347ca17a30d72b8f8ea2d2a784611c3acea9e0abda94743' + '00000000000000000000000000000003')
    root.sum.toString('hex').should.deep.equal(new BN(3).toString('hex'))
  })
  it('should generate an odd tree correctly', () => {
    const tree = new MerkleSumTree([
      {
        data: 'dead',
        sum: 1
      },
      {
        data: 'beef',
        sum: 2
      },
      {
        data: 'cafe',
        sum: 3
      }
    ])
    const root = tree.root()

    root.data.should.equal('9a700d776d853398a7ecc4c5f3b411d7fddddf73b47f8350c3cc85b89083f0f6' + '00000000000000000000000000000006')
    root.sum.toString('hex').should.deep.equal(new BN(6).toString('hex'))
  })
})
