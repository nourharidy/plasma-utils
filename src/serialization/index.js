const schemas = require('./schemas')
const models = require('./models')

const encode = (args, schema) => {
  return schema.encode(args)
}

const decode = (args, schema) => {
  return schema.decode(args)
}

module.exports = {
  schemas,
  models,
  encode,
  decode
}
