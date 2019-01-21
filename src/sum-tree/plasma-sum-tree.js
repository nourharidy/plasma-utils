const BigNum = require('bn.js')

const MerkleSumTree = require('./sum-tree')
const MerkleTreeNode = require('./merkle-tree-node')
const models = require('../serialization').models
const Transaction = models.Transaction
const Signature = models.Signature
// const SignedTransaction = models.SignedTransaction
const TransferProof = models.TransferProof
const TransactionProof = models.TransactionProof
const constants = require('../constants')

/**
 * Class that represents the special type of Merkle sum tree we use.
 * For more information, check out {@link https://plasma-core.readthedocs.io/en/latest/specs/sum-tree.html}
 */
class PlasmaMerkleSumTree extends MerkleSumTree {
  /**
   * Parses raw data into the set of leaf nodes.
   * @param {*} leaves List of raw leaves to be parsed.
   * @return {*} List of parsed leaf nodes.
   */
  parseLeaves (leaves) {
    // Pull out the start, end, and encoding of each transaction.
    leaves = leaves
      .reduce((prev, curr) => {
        let parsedTransfers = curr.transfers.map((transfer) => {
          return {
            start: new BigNum(transfer.decoded.start),
            end: new BigNum(transfer.decoded.end),
            encoded: '0x' + curr.encoded
          }
        })
        return prev.concat(parsedTransfers)
      }, [])
      .sort((a, b) => {
        return a.start - b.start
      })

    let parsed = []
    if (leaves.length === 1) {
      parsed.push(
        new MerkleTreeNode(
          PlasmaMerkleSumTree.hash(leaves[0].encoded),
          constants.MAX_COIN_ID
        )
      )
      return parsed
    }

    // For all leaves except the first and last,
    // sum at the leaves is defined as
    // start of the next leaf minus start of the current leaf.
    let curr, next, sum
    for (let i = 1; i < leaves.length - 1; i++) {
      curr = leaves[i]
      next = leaves[i + 1]
      sum = next.start.sub(curr.start)
      parsed.push(
        new MerkleTreeNode(PlasmaMerkleSumTree.hash(curr.encoded), sum)
      )
    }

    // Custom rule for the first leaf, if there's more than one.
    // Sum of the first leaf is always defined as
    // the start of its sibling transaction minus the minimum possible coin ID.
    // This is to allow for "implicit" non-inclusion proofs
    // for any ranges where `end` is less than `start` of the first transaction.
    parsed.unshift(
      new MerkleTreeNode(
        PlasmaMerkleSumTree.hash(leaves[0].encoded),
        leaves[1].start.sub(constants.MIN_COIN_ID)
      )
    )

    // Custom rule for the last leaf, if there's more than one.
    // Sum of the last leaf is always defined as
    // the maximum possible coin ID minus the start of the last transaction.
    // This is again to allow for "implicit" non-inclusion proofs
    // for any ranges where `start` is greater than `end`.
    parsed.push(
      new MerkleTreeNode(
        PlasmaMerkleSumTree.hash(leaves[leaves.length - 1].encoded),
        constants.MAX_COIN_ID.sub(leaves[leaves.length - 1].start)
      )
    )

    return parsed
  }

  /**
   * Returns an inclusion proof for the leaf at a given index.
   * @param {Number} index Index of the leaf to return a proof for.
   * @return {*} A serializaed TransferProof object.
   */
  getTransferProof (leafIndex, transferIndex) {
    // first arg is the index of the branch requested, second is the transfer that branch was included for
    if (leafIndex >= this.levels[0].length || leafIndex < 0) {
      throw new Error('Invalid leaf index')
    }

    // User needs to be given this extra information for calculating the bottommost node.
    const parsedSum = this.levels[0][leafIndex].sum

    // Each TR proof gets the signature for that transfer's sender
    const signature = new Signature(
      this.leaves[leafIndex].signatures[transferIndex]
    )

    let branch = []

    let parentIndex
    let node
    let siblingIndex = leafIndex + (leafIndex % 2 === 0 ? 1 : -1)
    for (let i = 0; i < this.levels.length - 1; i++) {
      node = this.levels[i][siblingIndex]
      if (node === undefined) {
        node = PlasmaMerkleSumTree.emptyLeaf().data
      }

      branch.push(node.data)

      // Figure out the parent and then figure out the parent's sibling.
      parentIndex = siblingIndex === 0 ? 0 : Math.floor(siblingIndex / 2)
      siblingIndex = parentIndex + (parentIndex % 2 === 0 ? 1 : -1)
    }
    return new TransferProof({
      parsedSum: parsedSum,
      leafIndex: leafIndex,
      inclusionProof: branch,
      signature: signature
    })
  }

  /**
   * Checks whether a given transaction was included in the right branch for a particula transfer.
   * @param {Transaction} transaction A Transaction object.
   * @param {Number} transferIndex Which transfer to check.
   * @param {*} transferProof A TransferProof object.
   * @param {*} root The root node of the tree to check.
   * @return {boolean} `true` if the transfer is in the tree, `false` otherwise.
   */

  static checkTransferProof (transaction, transferIndex, transferProof, root) {
    if (transaction instanceof String || typeof transaction === 'string') {
      transaction = new Transaction(transaction)
    }
    if (transferProof instanceof String || typeof transferProof === 'string') {
      transferProof = new TransferProof(transferProof)
    }

    const leafIndex = transferProof.args.leafIndex
    const inclusionProof = transferProof.args.inclusionProof

    // Covert the index into a bitstring
    let path = new BigNum(leafIndex).toString(2, inclusionProof.length)
    // Reverse the order of the bitstring to start at the bottom of the tree
    path = path
      .split('')
      .reverse()
      .join('')

    const transactionHash = PlasmaMerkleSumTree.hash('0x' + transaction.encoded)

    // check valid sig
    // debugger
    // const signature = transferProof.args.signature
    // SignedTransaction

    let computedNode = new MerkleTreeNode(
      transactionHash,
      transferProof.args.parsedSum
    )
    let leftSum = new BigNum(0)
    let rightSum = new BigNum(0)
    for (let i = 0; i < inclusionProof.length; i++) {
      const encodedSibling = inclusionProof[i]
      const sibling = new MerkleTreeNode(
        new BigNum(encodedSibling.slice(0, 32)).toString(16, 64),
        new BigNum(encodedSibling.slice(32, 48))
      )
      if (path[i] === '0') {
        computedNode = PlasmaMerkleSumTree.parent(computedNode, sibling)
        rightSum.add(sibling.sum)
      } else {
        computedNode = PlasmaMerkleSumTree.parent(sibling, computedNode)
        leftSum.add(sibling.sum)
      }
    }
    const rootSum = computedNode.sum
    const transfer = transaction.transfers[transferIndex].decoded
    const validSum =
      transfer.start.gte(leftSum) && transfer.end.lte(rootSum.sub(rightSum))
    const validRoot = computedNode.data === root
    return validSum && validRoot // && validSignature
  }

  /**
   * Returns an inclusion proof for the leaf at a given index.
   * @param {*} Transaction A transaction element in the sum tree's leaves.
   * @return {*} A serializaed TransactionProof object.
   */

  getTransactionProof (transaction) {
    let transactionLeafIndices = []
    for (let leafIndex in this.leaves) {
      if (this.leaves[leafIndex] === transaction) {
        transactionLeafIndices.push(new BigNum(leafIndex).toNumber())
      }
    }
    const transferProofs = transactionLeafIndices.map((leafIndex) => {
      return this.getTransferProof(
        leafIndex,
        transactionLeafIndices.indexOf(leafIndex)
      ) // this gets the TR index
    })
    return new TransactionProof({
      transferProofs: transferProofs.map((transferProof) => {
        return transferProof.decoded
      })
    })
  }

  /**
   * Checks whether a given transaction was included in the right branch for a particula transfer.
   * @param {Transaction} transaction A Transaction object.
   * @param {*} transactionProof A TransactionProof object.
   * @param {*} root The root node of the tree to check.
   * @return {boolean} `true` if the transaction is in the tree, `false` otherwise.
   */

  static checkTransactionProof (transaction, transactionProof, root) {
    const transferProofs = transactionProof.args.transferProofs.map(
      (transferProof) => {
        return { args: transferProof }
      }
    )
    return transferProofs.every((transferProof, transferIndex) => {
      return this.checkTransferProof(
        transaction,
        transferIndex,
        transferProof,
        root
      )
    })
  }
}

module.exports = PlasmaMerkleSumTree
