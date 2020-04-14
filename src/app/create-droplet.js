
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

const getSnapshot = async (client) => {
  const snapshots = await api.listSnapshots(client)

  const sorted = snapshots
    .filter(data => {
      return data.name.includes('minecraft-server')
    })
    .sort((data0, data1) => {
      return (new Date(data1.created_at)).getTime() - (new Date(data0.created_at)).getTime()
    })

  return sorted[0]
}

const recreateDroplet = async client => {
  const existingDroplet = await api.getDroplet(constants.vms.name, client)
  const snapshot = await getSnapshot(client)

  if (existingDroplet) {
    console.log(chalk.blue('VM already exists'))
    // check configuration matches.
  } else {
    console.log(chalk.yellow('VM does not exist'))

    const image = await getImage('ubuntu-16-04-x64', client)
    const key = await getKey('shared-minecraft', client)

    console.log(chalk.blue('Creating Droplet'))

    await api.createDroplet(image, key, client)

    const snapshot = await getSnapshot(client)
    const newDroplet = await api.getDroplet(constants.vms.name, client)

    if (snapshot) {
      console.log(chalk.blue('Applying snapshot to Droplet'))

      const snapshotStatus = await api.restoreDroplet(newDroplet, snapshot, client)

      const { action } = await snapshotStatus.json()

      if (action && action.status === 'in-progress') {
        console.log(chalk.blue('Restoring snapshot'))
      }
    }
  }
}

module.exports = recreateDroplet
