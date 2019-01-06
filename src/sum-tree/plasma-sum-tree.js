const BN = require('web3').utils.BN

const MerkleSumTree = require('./sum-tree')
const MerkleTreeNode = require('./merkle-tree-node')
const Transaction = require('../serialization').models.Transaction

class PlasmaMerkleSumTree extends MerkleSumTree {
  parseLeaves (leaves) {
    leaves = leaves.map((leaf) => {
      return {
        start: new BN(leaf.decoded.transfer.start),
        end: new BN(leaf.decoded.transfer.end),
        encoded: '0x' + leaf.encoded
      }
    })

    leaves[0].start = new BN(0)
    leaves.push({
      start: new BN('ffffffffffffffffffffffffffffffff', 16)
    })

    let parsed = []
    parsed.push(new MerkleTreeNode(PlasmaMerkleSumTree.hash(leaves[0].encoded), leaves[1].start))

    let curr, next, sum
    for (let i = 1; i < leaves.length - 1; i++) {
      curr = leaves[i]
      next = leaves[i + 1]
      sum = next.start.sub(curr.start)
      parsed.push(new MerkleTreeNode(PlasmaMerkleSumTree.hash(curr.encoded), sum))
    }

    return parsed
  }

  getBranch (index) {
    if (index >= this.levels[0].length || index < 0) {
      throw new Error('Invalid leaf index')
    }

    let branch = []
    branch.push({
      hash: '',
      sum: this.levels[0][index].sum
    })

    let parentIndex
    let node
    let siblingIndex = index + (index % 2 === 0 ? 1 : -1)
    for (let i = 0; i < this.levels.length - 1; i++) {
      node = this.levels[i][siblingIndex]
      if (node === undefined) {
        node = PlasmaMerkleSumTree.emptyLeaf()
      }

      branch.push({
        hash: node.hash,
        sum: node.sum
      })

      parentIndex = siblingIndex === 0 ? 0 : Math.floor(siblingIndex / 2)
      siblingIndex = parentIndex + (parentIndex % 2 === 0 ? 1 : -1)
    }

    return branch
  }

  static checkInclusion (index, transaction, proof, root) {
    if (transaction instanceof String || typeof transaction === 'string') {
      transaction = new Transaction(transaction)
    }

    // Covert the index into a bitstring
    let path = new BN(index).toString(2, proof.length)

    // Reverse the order of the bitstring to start at the bottom of the tree
    path = path.split('').reverse().join('')

    let pathIndex = 0
    let proofElement
    let computedNode = new MerkleTreeNode(PlasmaMerkleSumTree.hash('0x' + transaction.encoded), proof[0].sum)
    for (let i = 1; i < proof.length; i++) {
      proofElement = new MerkleTreeNode(proof[i].hash, proof[i].sum)
      if (path[pathIndex] === '0') {
        computedNode = PlasmaMerkleSumTree.parent(computedNode, proofElement)
      } else {
        computedNode = PlasmaMerkleSumTree.parent(proofElement, computedNode)
      }
      pathIndex++
    }

    return PlasmaMerkleSumTree.checkNodesEqual(computedNode, root)
  }

  static checkNodesEqual (a, b) {
    return ((BN.isBN(a.sum) && BN.isBN(b.sum)) &&
      a.sum.eq(b.sum) &&
      a.data === b.data)
  }
}

module.exports = PlasmaMerkleSumTree
