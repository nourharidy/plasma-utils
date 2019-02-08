const BaseSchemaType = require('./base-schema-type')

/**
 * Schema type for a buffer.
 */
class SchemaBuffer extends BaseSchemaType {
  constructor (options) {
    super(options)

    // Initialize available validators.
    this.validators = {
      length: (value) => {
        return {
          validate: (v) => {
            return v.length === value
          },
          message: 'Invalid Buffer length',
          type: 'length'
        }
      },
      required: (_) => {
        return {
          validate: (v) => {
            return v instanceof Buffer
          },
          message: 'Value must be a Buffer',
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
    if (value instanceof String || typeof value === 'string') {
      value = value.startsWith('0x') ? value.slice(2) : value
    }

    return Buffer.from(value, 'hex')
  }

  encode (value) {
    return value.toString('hex')
  }

  decode (value) {
    const decoded = Buffer.from(value, 'hex')
    this.validate(decoded)
    return decoded
  }
}

module.exports = SchemaBuffer
