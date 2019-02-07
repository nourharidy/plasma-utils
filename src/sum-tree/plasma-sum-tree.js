const BigNum = require('bn.js')
const web3Utils = require('../utils/web3')
const MerkleSumTree = require('./sum-tree')
const MerkleTreeNode = require('./merkle-tree-node')
const models = require('../serialization').models
const Transfer = models.Transfer
const UnsignedTransaction = models.UnsignedTransaction
const Signature = models.Signature
const TransferProof = models.TransferProof
const TransactionProof = models.TransactionProof
const constants = require('../constants')
const utils = require('../utils')

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
        const unsigned = new UnsignedTransaction(curr)
        let parsedTransfers = curr.transfers.map((transfer) => {
          const cast = new Transfer(transfer)
          return {
            start: new BigNum(cast.typedStart),
            end: new BigNum(cast.typedEnd),
            encoded: utils.add0x(unsigned.encoded)
          }
        })
        return prev.concat(parsedTransfers)
      }, [])
      .sort((a, b) => {
        return a.start.sub(b.start)
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
   * @return {TransferProof} A serialized TransferProof object.
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

    let inclusionProof = []
    let parentIndex
    let node
    let siblingIndex = leafIndex + (leafIndex % 2 === 0 ? 1 : -1)
    for (let i = 0; i < this.levels.length - 1; i++) {
      node = this.levels[i][siblingIndex]
      if (node === undefined) {
        node = PlasmaMerkleSumTree.emptyLeaf()
      }

      inclusionProof.push(node.data)

      // Figure out the parent and then figure out the parent's sibling.
      parentIndex = siblingIndex === 0 ? 0 : Math.floor(siblingIndex / 2)
      siblingIndex = parentIndex + (parentIndex % 2 === 0 ? 1 : -1)
    }

    return new TransferProof({
      parsedSum: parsedSum,
      leafIndex: leafIndex,
      inclusionProof: inclusionProof,
      signature: signature
    })
  }

  /**
   * Checks whether a given transaction was included in the right branch for a particula transfer.
   * @param {Transaction} transaction A Transaction object.
   * @param {Number} transferIndex Which transfer to check.
   * @param {TransferProof} transferProof A TransferProof object.
   * @param {string} root The root node of the tree to check.
   * @return {boolean} `true` if the transfer is in the tree, `false` otherwise.
   */
  static checkTransferProof (transaction, transferIndex, transferProof, root) {
    // Make sure the transaction is unsigned.
    transaction = new UnsignedTransaction(transaction)

    // Compute the root and bounds.
    const {
      computedRoot,
      implicitStart,
      implicitEnd
    } = PlasmaMerkleSumTree.calculateRootAndBounds(transaction, transferProof)

    const transfer = new Transfer(transaction.transfers[transferIndex])

    // Check validity conditions.
    const validSum =
      transfer.typedStart.gte(implicitStart) &&
      transfer.typedEnd.lte(implicitEnd)
    const validRoot = utils.remove0x(computedRoot) === utils.remove0x(root)
    const validSig =
      web3Utils.recover(
        transaction.hash,
        utils.signatureToString(transferProof.signature)
      ) === transfer.sender

    return validSum && validRoot && validSig
  }

  /**
   * Returns the implicit bounds of a transfer proof.
   * @param {UnsignedTransaction} transaction Transaction to check.
   * @param {TransferProof} transferProof A TransferProof for that transaction.
   * @return {Number, Number} The implicit start and implicit end.
   */
  static getTransferProofBounds (transaction, transferProof) {
    const {
      implicitStart,
      implicitEnd
    } = PlasmaMerkleSumTree.calculateRootAndBounds(transaction, transferProof)

    return {
      implicitStart,
      implicitEnd
    }
  }

  /**
   * Calculates the root and bounds for a given transfer proof.
   * @param {UnsignedTransaction} transaction Transaction to check.
   * @param {TransferProof} transferProof A TransferProof for that transaction.
   * @return {Number, Number, string} The implicit start, implicit end, and root.
   */
  static calculateRootAndBounds (transaction, transferProof) {
    transaction = new UnsignedTransaction(transaction)
    transferProof = new TransferProof(transferProof)

    const leafIndex = transferProof.leafIndex
    const inclusionProof = transferProof.inclusionProof

    // Covert the index into a bitstring
    let path = new BigNum(leafIndex).toString(2, inclusionProof.length)
    // Reverse the order of the bitstring to start at the bottom of the tree
    path = path
      .split('')
      .reverse()
      .join('')

    const transactionHash = PlasmaMerkleSumTree.hash(
      utils.add0x(transaction.encoded)
    )

    let computedNode = new MerkleTreeNode(
      transactionHash,
      transferProof.parsedSum
    )
    let leftSum = new BigNum(0)
    let rightSum = new BigNum(0)
    for (let i = 0; i < inclusionProof.length; i++) {
      let encodedSibling = inclusionProof[i]
      if (Buffer.isBuffer(encodedSibling)) {
        encodedSibling = encodedSibling.toString('hex')
      }
      const sibling = new MerkleTreeNode(
        encodedSibling.slice(0, 64),
        new BigNum(encodedSibling.slice(-32), 'hex')
      )
      if (path[i] === '0') {
        computedNode = PlasmaMerkleSumTree.parent(computedNode, sibling)
        rightSum = rightSum.add(sibling.sum)
      } else {
        computedNode = PlasmaMerkleSumTree.parent(sibling, computedNode)
        leftSum = leftSum.add(sibling.sum)
      }
    }

    return {
      computedRoot: computedNode.data,
      implicitStart: new BigNum(leftSum.toString('hex'), 'hex'),
      implicitEnd: new BigNum(
        computedNode.sum.sub(rightSum).toString('hex'),
        'hex'
      )
    }
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
      transferProofs: transferProofs
    })
  }

  /**
   * Checks whether a given transaction was included in the right branch for a particula transfer.
   * @param {UnsignedTransaction} transaction An UnsignedTransaction object.
   * @param {TransactionProof} transactionProof A TransactionProof object.
   * @param {string} root The root node of the tree to check.
   * @return {boolean} `true` if the transaction is in the tree, `false` otherwise.
   */
  static checkTransactionProof (transaction, transactionProof, root) {
    return transactionProof.transferProofs.every(
      (transferProof, transferIndex) => {
        return this.checkTransferProof(
          transaction,
          transferIndex,
          transferProof,
          root
        )
      }
    )
  }
}

module.exports = PlasmaMerkleSumTree
