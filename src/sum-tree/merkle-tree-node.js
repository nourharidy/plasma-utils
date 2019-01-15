const BN = require('web3').utils.BN

/**
 * Represents a Merkle tree node.
 */
class MerkleTreeNode {
  constructor (hash, sum) {
    this.sum = new BN(sum)

    if (hash.startsWith('0x')) {
      hash = hash.slice(2)
    }

    this.hash = hash
    this.data = hash + this.sum.toString(16, 32)
  }
}

module.exports = MerkleTreeNode
