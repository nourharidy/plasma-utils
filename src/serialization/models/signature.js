const BaseModel = require('./base-model')
const schemas = require('../schemas')

class Signature extends BaseModel {
  constructor (args) {
    super(args, schemas.SignatureSchema)
  }
}

module.exports = Signature
