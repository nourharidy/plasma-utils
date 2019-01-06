const BN = require('web3').utils.BN
const BaseSchemaType = require('./base-schema-type')

/**
 * Schema type for an array of bytes.
 */
class SchemaByteArray extends BaseSchemaType {
  constructor (options) {
    super(options)

    // Initialize available validators.
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

  get length () {
    return this.options.length * 2
  }

  preprocess (value) {
    // Internally store as a Buffer.
    if (value instanceof String || typeof value === 'string') {
      return Buffer.from(value, 'hex')
    } else {
      const bnValue = new BN(value)
      const length = Math.max(bnValue.byteLength(), this.options.length)
      return bnValue.toBuffer('be', length)
    }
  }

  encode (value) {
    return value.toString('hex')
  }

  decode (value) {
    // Externally expose a BigNum.
    return new BN(value, 16).toBuffer('be', this.options.length)
  }
}

module.exports = SchemaByteArray
