const BigNum = require('bn.js')
const utils = require('../utils')

/**
 * Represents a Merkle tree node.
 */
class MerkleTreeNode {
  constructor (hash, sum) {
    this.sum = new BigNum(sum, 'hex')

    this.hash = utils.remove0x(hash)
    this.data = this.hash + this.sum.toString(16, 32)
  }
}

module.exports = MerkleTreeNode
