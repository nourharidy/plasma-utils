const miscUtils = require('./misc')
const txUtils = require('./transaction')
const web3Utils = require('./web3')

const utils = Object.assign({}, miscUtils, txUtils, web3Utils)

module.exports = utils
