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

module.exports = Schema
