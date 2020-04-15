
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')

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

/**
 * Attempts to restore a snapshot, but will provision a server
 * from scratch if this snapshot does not exist.
 *
 *
 * @param {*} client
 */
const recreateDroplet = async client => {
  const existingDroplet = await api.getDroplet(constants.vms.name, client)

  if (existingDroplet) {
    console.log(chalk.blue('VM already exists'))

    return {
      droplet: existingDroplet
    }
  }

  console.log(chalk.yellow('VM does not exist'))

  const image = await api.getImage(constants.os.ubuntu, client)

  if (!image) {
    throw new Error('count not find OS image.')
  }

  const key = await api.getSSHKey(constants.sshKeys.shared, client)

  if (!key) {
    throw new Error('failed to get SSH key.')
  }

  console.log(chalk.blue('Creating Droplet'))

  const newDroplet = await api.createDroplet(image, key, client)

  const snapshot = await getSnapshot(client)

  if (snapshot) {
    console.log(chalk.blue('Applying snapshot to Droplet'))

    const action = await api.restoreDroplet(newDroplet, snapshot, client)

    if (action && action.status === 'in-progress') {
      console.log(chalk.blue('Restoring snapshot...'))
    } else {
      console.log(chalk.yellow(action.status))
    }
  }

  return {
    droplet: newDroplet
  }
}

module.exports = recreateDroplet
