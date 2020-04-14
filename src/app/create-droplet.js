
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')

const getImage = async(slug, client) => {
  const images = await api.listImages(client)

  return images.find(data => {
    return data.slug === slug
  })
}

const getKey = async (name, client) => {
  const keys = await api.listKeys(client)
  return keys.find(data => {
    return data.name === name
  })
}

const recreateDroplet = async client => {
  const exists = await api.dropletExists(constants.vms.name, client)

  if (exists) {
    console.log(chalk.blue('VM already exists'))
  } else {
    console.log(chalk.yellow('VM does not exist'))

    const image = await getImage('ubuntu-16-04-x64', client)
    const key = await getKey('shared-minecraft', client)

    await api.createDroplet(image, key, client)
  }
}

module.exports = recreateDroplet
