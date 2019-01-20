const BigNum = require('bn.js')
const BaseSchemaType = require('./base-schema-type')

class SchemaNumber extends BaseSchemaType {
  constructor (options) {
    super(options)

    // Initialize available validators.
    this.validators = {
      length: (value) => {
        return {
          validate: (v) => {
            return v.byteLength() <= value
          },
          message: 'Number is too large',
          type: 'length'
        }
      },
      required: (_) => {
        return {
          validate: (v) => {
            return BigNum.isBN(v)
          },
          message: 'Value must be a BigNum',
          type: 'required'
        }
      }
    }

    this._initValidators()
  }

  get length () {
    return this.options.length * 2
  }

  cast (value) {
    return new BigNum(value, 'hex')
  }

  encode (value) {
    return value.toString('hex', this.length)
  }

  decode (value) {
    const trimmed = value.replace(/\b(0(?!\b))+/g, '')
    const decoded = new BigNum(trimmed, 'hex')
    this.validate(decoded)
    return decoded
  }
}

module.exports = SchemaNumber
