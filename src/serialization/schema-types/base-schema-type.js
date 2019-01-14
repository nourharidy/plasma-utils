/**
 * Base schema type that can be extended.
 */
class BaseSchemaType {
  constructor (options) {
    this.options = options
    this.validators = {}
    this.activeValidators = []
  }

  /**
   * Checks if this element is required.
   * @return {boolean} `true` if the element is required, `false` otherwise.
   */
  get required () {
    return this.getValidator('required') !== undefined
  }

  /**
   * Returns the fixed field size of this element.
   * @return {Number} Character size of this element.
   */
  get length () {
    return this.options.length
  }

  /**
   * Adds a validator to this element.
   * @param {String} type Validator type.
   * @param {*} value Value to be checked against.
   */
  addValidator (type, value) {
    if (!(type in this.validators)) {
      return
    }
    this.activeValidators.push(this.validators[type](value))
  }

  /**
   * Gets a validator by type.
   * @param {String} type Validator type.
   * @return {*} The validator.
   */
  getValidator (type) {
    return this.activeValidators.find((validator) => {
      return validator.type === type
    })
  }

  /**
   * Checks a value against a validator.
   * @param {*} validator Validator to check against.
   * @param {*} value Value to check.
   */
  checkValidator (validator, value) {
    if (validator instanceof String) {
      validator = this.getValidator(validator)
    }

    if (!validator.validate(value)) {
      throw new Error(validator.message)
    }
  }

  /**
   * Checks a value against all active validators.
   * @param {*} value Value to check.
   */
  validate (value) {
    this.activeValidators.forEach((validator) => {
      this.checkValidator(validator, value)
    })
  }

  /**
   * Preprocesses a value to fit this schema type, if possible.
   * @param {*} value Value to process.
   * @return {*} The processed value.
   */
  cast (value) {
    return value
  }

  /**
   * Encodes the value as a hex string.
   * @param {*} value Value to encode.
   * @return {*} The encoded value.
   */
  encode (value) {
    return value
  }

  /**
   * Decodes a hex string value to fit this schema type.
   * @param {*} value Value to decode.
   * @return {*} The decoded object.
   */
  decode (value) {
    return value
  }

  /**
   * Initializes all validators by the given options.
   */
  _initValidators () {
    for (let key in this.options) {
      this.addValidator(key, this.options[key])
    }
  }
}

module.exports = BaseSchemaType
