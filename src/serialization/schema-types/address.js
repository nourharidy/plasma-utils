const web3Utils = require('../../utils/web3')
const BaseSchemaType = require('./base-schema-type')

/**
 * Schema type for an address.
 */
class SchemaAddress extends BaseSchemaType {
  constructor (options) {
    super(options)

    this.validators = {
      required: (_) => {
        return {
          validate: (v) => {
            return web3Utils.isAddress(v)
          },
          message: 'Address must be a valid Ethereum address',
          type: 'required'
        }
      }
    }

    this._initValidators()
  }

  get length () {
    return 40
  }

  encode (value) {
    return value.substring(2)
  }

  decode (value) {
    const decoded = '0x' + value
    this.validate(decoded)
    return web3Utils.toChecksumAddress(decoded)
  }
}

module.exports = SchemaAddress
