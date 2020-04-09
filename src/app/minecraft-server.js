
const fs = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
const chalk = require('chalk')

const constants = require('../commons/constants')

const actions = {
  recreateDroplet: require('../app/recreate-droplet')
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

const api = token => ({ method = 'GET', path, headers }) => {
  const url = `${constants.urls.digitalocean}/${path}`

  return fetch(url, {
    method: method.toLowerCase(),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

}

const minecraftServer = async args => {
  const env = await preprocess.env()

  const client = api(env.TOKEN)
  await actions.recreateDroplet(client)
}

module.exports = minecraftServer
