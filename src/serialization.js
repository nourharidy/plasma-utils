const web3 = require('web3')
const BN = web3.utils.BN

class BaseSchemaType {
  constructor (options) {
    this.options = options
    this.validators = {}
    this.activeValidators = []
  }

  get required () {
    return this.getValidator('required') !== undefined
  }

  get length () {
    return this.options.length
  }

  addValidator (type, value) {
    if (!(type in this.validators)) {
      return
    }
    this.activeValidators.push(this.validators[type](value))
  }

  getValidator (type) {
    return this.activeValidators.find((validator) => {
      return validator.type === type
    })
  }

  checkValidator (validator, value) {
    if (validator instanceof String) {
      validator = this.getValidator(validator)
    }

    if (!validator.validate(value)) {
      throw new Error(validator.message)
    }
  }

  validate (value) {
    this.activeValidators.forEach((validator) => {
      this.checkValidator(validator, value)
    })
  }

  preprocess (value) {
    return value
  }

  encode (value) {
    return value
  }

  decode (value) {
    return value
  }

  _initValidators () {
    for (let key in this.options) {
      this.addValidator(key, this.options[key])
    }
  }
}

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

class SchemaAddress extends BaseSchemaType {
  constructor (options) {
    super(options)

    this.validators = {
      required: (_) => {
        return {
          validate: (v) => {
            return (web3.utils.isAddress(v))
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
    return '0x' + value
  }
}

class Schema {
  constructor (fields) {
    this.fields = {}
    for (let key in fields) {
      let field = fields[key]
      this.fields[key] = new field.type(field)
    }
  }

  validate (object) {
    for (let key in this.fields) {
      let field = this.fields[key]
      field.validate(object[key])
    }
  }

  preprocess (object) {
    for (let key in this.fields) {
      let field = this.fields[key]
      object[key] = field.preprocess(object[key])
    }
    return object
  }

  encode (object) {
    let encoded = ''
    for (let key in this.fields) {
      let field = this.fields[key]
      encoded += field.encode(object[key])
    }
    return encoded
  }

  decode (object) {
    let decoded = {}
    for (let key in this.fields) {
      let field = this.fields[key]
      let slice = object.slice(0, field.length)
      decoded[key] = field.decode(slice)
    }
    return decoded
  }
}

const Address = SchemaAddress
const ByteArray = SchemaByteArray
const schemas = {
  TransferRecordSchema: new Schema({
    sender: {
      type: Address,
      required: true
    },
    recipient: {
      type: Address,
      required: true
    },
    token: {
      type: ByteArray,
      length: 4,
      required: true
    },
    start: {
      type: ByteArray,
      length: 12,
      required: true
    },
    end: {
      type: ByteArray,
      length: 12,
      required: true
    },
    block: {
      type: ByteArray,
      length: 32,
      required: true
    }
  }),
  SignatureSchema: new Schema({
    v: {
      type: ByteArray,
      length: 1,
      required: true
    },
    r: {
      type: ByteArray,
      length: 32,
      required: true
    },
    s: {
      type: ByteArray,
      length: 32,
      required: true
    }
  })
}

class TransferRecord {
  constructor (args) {
    this.schema = schemas.TransferRecordSchema

    if (args instanceof String || typeof args === 'string') {
      args = this.schema.decode(args)
    }

    this.args = this.schema.preprocess(args)
    this.schema.validate(args)
  }

  encode () {
    return this.schema.encode(this.args)
  }
}

module.exports = {
  schemas,
  TransferRecord
}
