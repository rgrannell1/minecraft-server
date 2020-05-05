
const log = require('../commons/log')

const destroyDroplet = async client => {

  const exists = await api.dropletExists(constants.vms.name, client)

  if (!exists) {
    log.warning(`VM does not exists, so job done!`)
    process.exit(0)
  }

  // -- shutdown, snapshot, delete

  // get droplet and id

  await api.snapshot(id, constants.snapshots.name, client)


}

module.exports = destroyDroplet
