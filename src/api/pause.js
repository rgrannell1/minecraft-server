
const path = require('path')

if (process.env.NOW_REGION === "dev1") {  // eslint-disable-next-line global-require
  require("dotenv").config({
    path: path.join(__dirname, '../.env')
  })
}

const api = require('../commons/api')

const constants = require('../commons/constants')
const utils = require('../commons/api-utils')
const errors = require('@rgrannell/errors')

const postPause = (req, res) => {
  const client = api.client(process.env.TOKEN)

  // await shutdown
  // snapshot



}

const preprocess = (req, res) => {
  if (req.method !== 'POST') {
    throw errors.methodNotAllowed('Only POST method supported', 405)
  }

  if (!req.query.dropletId) {
    throw errors.unprocessableEntity('no droplet ID provided', 422)
  }

  utils.assertEnvVariables(constants.zeitEnvVariables)
}

module.exports = async (req, res) => {
  console.log(`${req.method} ${req.path}`)

  try {
    preprocess(req, res)
    utils.authenticate(req, res)

    postPause(req, res)

    res.send('')

  } catch (err) {
    utils.handleErrors(err, res)
  }
}
