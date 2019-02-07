const web3Utils = require('../../utils/web3')
const miscUtils = require('../../utils/misc')

/**
 * Base model that makes use of a particular schema.
 * Can be extended by other classes with different schemas.
 */
class BaseModel {
  constructor (args, schema) {
    this.schema = schema
    this._parseArgs(args)
  }

  get encoded () {
    return this.schema.encode(this)
  }

  get decoded () {
    return this.schema.cast(this)
  }

  get hash () {
    return web3Utils.sha3('0x' + this.encoded)
  }

  _parseArgs (args) {
    if (Buffer.isBuffer(args)) {
      args = args.toString('hex')
    }
    if (miscUtils.isString(args)) {
      args = miscUtils.remove0x(args)
      args = this.schema.decode(args)
    }
    if (miscUtils.isObject(args)) {
      args = Object.assign({}, args)
    }

    args = this.schema.cast(args)
    this.schema.validate(args)

    Object.assign(this, args)
  }
}

module.exports = BaseModel
