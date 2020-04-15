
const fs = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
const chalk = require('chalk')

const constants = require('../commons/constants')

const actions = {
  createDroplet: require('./create-droplet'),
  createFloatingIp: require('./create-floating-ip')
}

const preprocess = {}

preprocess.env = async () => {
  try {
    await fs.access(constants.paths.env)
  } catch (err) {
    console.error(chalk.red(`${constants.paths.env} file does not exist`))
    process.exit(1)
  }

  return require('dotenv').config().parsed
}

const api = token => ({ method = 'GET', path, headers, body }) => {
  const url = `${constants.urls.digitalocean}/${path}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  return fetch(url, {
    ...config,
    method: method.toLowerCase(),
  })

}

const minecraftServer = async args => {
  const env = await preprocess.env()
  const client = api(env.TOKEN)

  if (args.create) {
    const { droplet } = await actions.createDroplet(client)

    await actions.createFloatingIp(droplet, client)
  } else if (args.destroy) {
    await actions.destroyDroplet(client)
  }
}

module.exports = minecraftServer
