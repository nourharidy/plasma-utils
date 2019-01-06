const web3 = require('web3')
const MerkleTreeNode = require('./merkle-tree-node')

class MerkleSumTree {
  constructor (leaves) {
    if (!leaves) {
      this.leaves = []
      this.levels = this.generate([], [[]])
    } else {
      this.leaves = leaves
      let bottom = this.parseLeaves(leaves)
      this.levels = this.generate(bottom, [bottom])
    }
  }

  static hash (value) {
    return web3.utils.soliditySha3(value)
  }

  static parent (left, right) {
    return new MerkleTreeNode(MerkleSumTree.hash('0x' + left.data + right.data), (left.sum.add(right.sum)))
  }

  static emptyLeaf () {
    return new MerkleTreeNode('0x0000000000000000000000000000000000000000000000000000000000000000', 0)
  }

  root () {
    return this.levels[this.levels.length - 1][0]
  }

  parseLeaves (leaves) {
    return leaves.map((leaf) => {
      return new MerkleTreeNode(MerkleSumTree.hash(leaf.data), leaf.sum)
    })
  }

  generate (children, levels) {
    if (children.length <= 1) {
      return [children]
    }

    let parents = []
    for (let i = 0; i < children.length; i += 2) {
      let left = children[i]
      let right = (i + 1 === children.length) ? MerkleSumTree.emptyLeaf() : children[i + 1]
      let parent = MerkleSumTree.parent(left, right)
      parents.push(parent)
    }

    levels.push(parents)
    this.generate(parents, levels)
    return levels
  }
}

module.exports = MerkleSumTree
