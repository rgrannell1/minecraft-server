
const fs = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')

const log = require('../commons/log')
const constants = require('../commons/constants')

const actions = {
  createDroplet: require('./create-droplet'),
  createFloatingIp: require('./create-floating-ip'),
  validateInstall: require('./validate-install')
}

const preprocess = {}

/**
 * Check that the environment is correctly configured
 *
 * @returns {object} environment configuration.
 */
preprocess.env = async () => {
  try {
    await fs.access(constants.paths.env)
  } catch (err) {
    log.error(`${constants.paths.env} file does not exist`)
    process.exit(1)
  }

  return require('dotenv').config().parsed
}

/**
 * Create a shallow wrapper around fetch to make requests to digitalocean
 *
 * @param {string} token the digitalocean token
 *
 * @returns {function} a fetch API wrapper
 */
const api = token => ({ method = 'GET', path, headers, body }) => {
  const url = path.startsWith('/')
    ? `${constants.urls.digitalocean}${path}`
    : `${constants.urls.digitalocean}/${path}`

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
    method,
  })
}

/**
 * Create or Deprovision a Minecraft Server
 *
 * @param {object} args CLI arguments
 */
const minecraftServer = async args => {
  const env = await preprocess.env()
  const client = api(env.TOKEN)

  if (args.create) {
    const { droplet } = await actions.createDroplet(client)

    const address = await actions.createFloatingIp(droplet, client)
    await actions.validateInstall(address, env.SSH_PASSWORD, client)

    // todo remove.
    console.log('deleting')

    const res = await client({
      method: 'DELETE',
      path: `/droplets/${droplet.id}`
    })

    if (!res.ok) {
      throw res
    }

    console.log('done')

  } else if (args.destroy) {
    await actions.destroyDroplet(client)
  }
}

module.exports = minecraftServer
