/**
 * Class used to define schemas.
 */
class Schema {
  constructor (fields) {
    this.fields = this._parseFields(fields)
  }

  /**
   * Returns the full character size of all available fields.
   * @return {Number} Total character size.
   */
  get length () {
    let length = 0
    for (let key in this.fields) {
      length += this.fields[key].length
    }
    return length
  }

  /**
   * Validates an object against the schema.
   * @param {*} object Object to check.
   */
  validate (object) {
    for (let key in this.fields) {
      let field = this.fields[key]
      field.validate(object[key])
    }
  }

  /**
   * Tries to fit an object to the schema.
   * @param {*} object Object to fit.
   * @return {*} The modified object.
   */
  preprocess (object) {
    for (let key in this.fields) {
      let field = this.fields[key]
      object[key] = field.preprocess(object[key])
    }
    return object
  }

  /**
   * Encodes an object to a hex string.
   * @param {*} object Object to encode.
   * @return {String} Encoded object.
   */
  encode (object) {
    let encoded = ''
    for (let key in this.fields) {
      let field = this.fields[key]
      encoded += field.encode(object[key])
    }
    return encoded
  }

  /**
   * Decodes a hex string into an object that fits the schema.
   * @param {*} str String to decode.
   * @return {*} Decoded object.
   */
  decode (str) {
    let decoded = {}
    let currentIndex = 0
    for (let key in this.fields) {
      let field = this.fields[key]
      let slice = str.slice(currentIndex, currentIndex + field.length)
      currentIndex += field.length
      decoded[key] = field.decode(slice)
    }
    return decoded
  }

  /**
   * Parses the given fields into instances of each schema type.
   */
  _parseFields (fields) {
    let parsedFields = {}
    for (let key in fields) {
      let field = fields[key]
      if (field.type instanceof Schema) {
        // Using a Schema as a SchemaType is OK.
        parsedFields[key] = field.type
      } else {
        parsedFields[key] = new field.type(field)
      }
    }
    return parsedFields
  }
}

module.exports = Schema
