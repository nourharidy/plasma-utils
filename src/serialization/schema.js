class Schema {
  constructor (fields) {
    this.fields = this._parseFields(fields)
  }

  get length () {
    let length = 0
    for (let key in this.fields) {
      length += this.fields[key].length
    }
    return length
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
    let currentIndex = 0
    for (let key in this.fields) {
      let field = this.fields[key]
      let slice = object.slice(currentIndex, currentIndex + field.length)
      currentIndex += field.length
      decoded[key] = field.decode(slice)
    }
    return decoded
  }

  _parseFields (fields) {
    let parsedFields = {}
    for (let key in fields) {
      let field = fields[key]
      if (field.type instanceof Schema) {
        parsedFields[key] = field.type
      } else {
        parsedFields[key] = new field.type(field)
      }
    }
    return parsedFields
  }
}

module.exports = Schema
