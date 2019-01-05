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

module.exports = BaseSchemaType
