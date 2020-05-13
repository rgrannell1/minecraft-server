
const api = require('../commons/api')

const constants = require('../commons/constants')
const utils = require('../commons/api-utils')
const errors = require('@rgrannell/errors')

const postPause = (req, res) => {
  res.status(200)
  res.send('hello')

  const client = api(process.env.TOKEN)
}

const preprocess = (req, res) => {
  if (req.method !== 'POST') {
    throw errors.methodNotAllowed('Only POST method supported', 405)
  }

  utils.assertEnvVariables(constants.zeitEnvVariables)
}

module.exports = async (req, res) => {
  console.log(`${req.method} ${req.path}`)

  try {
    preprocess(req, res)
    utils.authenticate(req, res)

    postPause(req, res)
  } catch (err) {
    utils.handleErrors(err, res)
  }
}
