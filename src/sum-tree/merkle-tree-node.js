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

  /**
   * Checks if this node is equivalent to another.
   * @param {*} other The other node.
   * @return {boolean} `true` if the two nodes are equal, `false` otherwise.
   */
  equals (other) {
    return ((BN.isBN(this.sum) && BN.isBN(other.sum)) &&
      this.sum.eq(other.sum) &&
      this.data === other.data)
  }
}

module.exports = MerkleTreeNode
