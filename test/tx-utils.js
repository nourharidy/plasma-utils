const Transaction = require('../src/serialization').models.Transaction
const Web3 = require('web3')
const web3 = new Web3()
const BN = Web3.utils.BN

const getRandomInt = (numBytes) => {
  let bytes = []
  for (let i = 0; i < numBytes; i++) {
    bytes.push(Math.floor(Math.random() * (256)))
  }
  return new BN(bytes)
}

const getRandomAddress = () => {
  return web3.eth.accounts.create().address
}

const getSequentialTxs = (n) => {
  let txs = []

  for (let i = 0; i < n; i++) {
    txs[i] = new Transaction({
      transfer: {
        sender: getRandomAddress(),
        recipient: getRandomAddress(),
        token: 0,
        start: i * 10,
        end: (i + 1) * 10,
        block: 0
      },
      signature: {
        v: getRandomInt(1),
        r: getRandomInt(32),
        s: getRandomInt(32)
      }
    })
  }

  return txs
}

module.exports = {
  getSequentialTxs
}
