const Schema = require('./schema')
const Address = require('./schema-types/address')
const ByteArray = require('./schema-types/byte-array')

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
