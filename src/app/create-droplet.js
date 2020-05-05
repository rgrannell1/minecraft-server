
const api = require('../commons/api')
const log = require('../commons/log')
const constants = require('../commons/constants')

/**
 * Get the most recent snapshot for the droplet
 *
 * @param {*} client the API client
 *
 * @returns {Object} the snapshot data
 */
const getRecentSnapshot = async (client) => {
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
 * @param {object} client
 *
 * @returns {object} a droplet
 */
const recreateDroplet = async client => {
  const existingDroplet = await api.getDroplet(constants.vms.name, client)

  if (existingDroplet) {
    log.success('VM already exists')

    return {
      droplet: existingDroplet
    }
  }

  log.warning('VM does not exist')

  const image = await api.getImage(constants.os.ubuntu, client)

  if (!image) {
    throw new Error('count not find OS image.')
  }

  const key = await api.getSSHKey(constants.sshKeys.shared, client)

  if (!key) {
    throw new Error('failed to get SSH key.')
  }

  log.success('Creating Droplet')

  const newDroplet = await api.createDroplet(image, key, client)

  const snapshot = await getRecentSnapshot(client)

  if (snapshot) {
    log.success('Applying snapshot to Droplet')

    const action = await api.restoreDroplet(newDroplet, snapshot, client)

    if (action && action.status === 'in-progress') {
      log.success('Restoring snapshot...')
    } else {
      log.warning(action.status)
    }

    log.success('Checking Server Status...')

  } else {
    log.success('Validating Installation...')
  }

  return {
    droplet: newDroplet
  }
}

module.exports = recreateDroplet
