
const fs = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
const execa = require('execa')

const log = require('../commons/log')
const constants = require('../commons/constants')
const api = require('../commons/api')

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

  return require('dotenv').config({
    path: constants.paths.env
  }).parsed
}

/**
 * Create or Deprovision a Minecraft Server
 *
 * @param {object} args CLI arguments
 */
const minecraftServer = async args => {
  const env = await preprocess.env()
  const client = api.client(env.TOKEN)

  if (args.create) {
    const { droplet } = await actions.createDroplet(client)

    const address = await actions.createFloatingIp(droplet, client)
    await actions.validateInstall(address, env.SSH_PASSWORD, client)

    const cmd = execa('ansible-playbook', [constants.paths.configurePlaybook, '-i', constants.paths.inventory], {
      env: {
        DROPLET_IP: address,
        DROPLET_ID: droplet.id
      }
    })

    cmd.stdout.pipe(process.stdout)
    cmd.stderr.pipe(process.stderr)

    await cmd

    console.log('done')
    process.exit(0)

  } else if (args.destroy) {
    await actions.destroyDroplet(client)
  }
}

module.exports = minecraftServer
