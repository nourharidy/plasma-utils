const BigNum = require('bn.js')
const miscUtils = require('../utils/misc')

/**
 * Class used to define schemas.
 */
class Schema {
  constructor (fields) {
    this.unparsedFields = fields
    this.fields = this._parseFields(fields)
  }

  /**
   * Returns the full character size of all available fields.
   * @return {Number} Total character size.
   */
  get length () {
    let length = 0
    for (let key in this.fields) {
      let field = this.fields[key]
      length += field.length + Number(field.isArray) * 2
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
      if (field.isArray) {
        object[key].forEach(field.validate.bind(field))
      } else {
        field.validate(object[key])
      }
    }
  }

  /**
   * Tries to fit an object to the schema.
   * @param {*} object Object to fit.
   * @return {*} The modified object.
   */
  cast (object) {
    // Convert buffers to hex strings.
    if (Buffer.isBuffer(object)) {
      object = object.toString('hex')
    }
    // Convert hex strings to objects.
    if (miscUtils.isString(object)) {
      object = miscUtils.remove0x(object)
      object = this.decode(object)
    }

    // Work on a copy of the object.
    object = Object.assign({}, object)

    let ret = {}
    for (let key in this.fields) {
      let field = this.fields[key]
      if (field.isArray) {
        ret[key] = object[key].map(field.cast.bind(field))
      } else {
        ret[key] = field.cast(object[key])
      }
    }
    return ret
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
      if (field.isArray) {
        encoded += new BigNum(object[key].length).toString('hex', 2)
        for (let i = 0; i < object[key].length; i++) {
          encoded += field.encode(object[key][i])
        }
      } else {
        encoded += field.encode(object[key])
      }
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

    const slice = (string, length) => {
      const ret = string.slice(currentIndex, currentIndex + length)
      currentIndex += length
      return ret
    }

    for (let key in this.fields) {
      let field = this.fields[key]
      if (field.isArray) {
        decoded[key] = []

        let arrLen = new BigNum(slice(str, 2), 'hex').toNumber()
        for (let i = 0; i < arrLen; i++) {
          decoded[key].push(field.decode(slice(str, field.length)))
        }
      } else {
        decoded[key] = field.decode(slice(str, field.length))
      }
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
      const isArray = Array.isArray(field.type)
      const type = isArray ? field.type[0] : field.type
      parsedFields[key] =
        type instanceof Schema
          ? new Schema(type.unparsedFields)
          : new type(field)
      parsedFields[key].isArray = isArray
    }
    return parsedFields
  }
}

module.exports = Schema
