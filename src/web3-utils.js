const { Accounts } = require('web3-eth-accounts')
const web3Accounts = new Accounts('http://localhost:8545')

module.exports = Object.assign(web3Accounts, web3Accounts.utils)
