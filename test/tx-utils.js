const Transaction = require('../src/serialization').models.Transaction

/**
 * Returns a list of `n` sequential transactions.
 * @param {*} n Number of sequential transactions to return.
 * @return {*} A list of sequential transactions.
 */
const getSequentialTxs = (n) => {
  let txs = []

  for (let i = 0; i < n; i++) {
    txs[i] = new Transaction({
      transfer: {
        sender: '0x0000000000000000000000000000000000000000',
        recipient: '0x0000000000000000000000000000000000000000',
        token: 0,
        start: i * 10,
        end: (i + 1) * 10,
        block: 0
      },
      signature: {
        v: 0,
        r: 0,
        s: 0
      }
    })
  }

  return txs
}

module.exports = {
  getSequentialTxs
}
