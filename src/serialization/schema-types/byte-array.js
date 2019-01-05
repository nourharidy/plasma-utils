const BN = require('web3').utils.BN
const BaseSchemaType = require('./base-schema-type')

class SchemaByteArray extends BaseSchemaType {
  constructor (options) {
    super(options)

    this.validators = {
      length: (value) => {
        return {
          validate: (v) => {
            return (v.length === value)
          },
          message: 'Invalid ByteArray length',
          type: 'length'
        }
      },
      required: (_) => {
        return {
          validate: (v) => {
            return (v instanceof Buffer)
          },
          message: 'ByteArray must be a Buffer',
          type: 'required'
        }
      }
    }

    this._initValidators()
  }

  preprocess (value) {
    return new BN(value).toBuffer('be', this.options.length)
  }

  encode (value) {
    return value.toString('hex')
  }

  decode (value) {
    return Buffer.from(value, 'hex')
  }
}

module.exports = SchemaByteArray
