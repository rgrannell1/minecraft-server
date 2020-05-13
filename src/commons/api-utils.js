
const basicAuth = require('basic-auth')
const errors = require('@rgrannell/errors')

const utils = {}

utils.handleErrors = (err, res) => {
  if (!err) {
    throw new Error('no error provided.')
  }

  if (!res) {
    throw new Error('no response object provided.')
  }

  if (err.code && err.stack) {
    res.status(err.code)

    res.json({
      message: err.message,
      code: err.code
    })
  } else {
    console.error(err.message)

    const body = JSON.stringify({
      message: err.message
    })

    res.status(500)
    res.send(body)
  }
}

utils.authenticate = (req, res) => {
  const parsed = basicAuth(req)

  if (!parsed) {
    throw errors.unauthorized('request unauthenticated', 401)
  }

  if (!req.headers || !req.headers['authorization']) {
    throw errors.unauthorized('no credentials provided', 401)
  }

  const isValidUser = parsed.name === process.env.BASIC_AUTH_USER
  const isValidPass = parsed.pass === process.env.BASIC_AUTH_PASS

  if (!isValidUser) {
    throw errors.unauthorized('invalid username provided', 401)
  }

  if (!isValidPass) {
    throw errors.unauthorized('invalid password provided', 401)
  }


}

utils.assertEnvVariables = variables => {
  variables.forEach(variable => {
    if (!process.env[variable]) {
      console.log(`${variable} variable missing`)

      throw errors.internalServerError('process environmental variable missing', 500)
    }
  })
}


module.exports = utils
