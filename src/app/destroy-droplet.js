
const chalk = require('chalk')

const destroyDroplet = client => {

  const exists = await api.dropletExists(constants.vms.name, client)

  if (!exists) {
    console.error(chalk.yellow(`VM does not exists, so job done!`))
    process.exit(0)
  }

  // -- shutdown, snapshot, delete

  const res = await client({
    path: `/droplets/${id}/actions`,
    body: {
      type: 'snapshot',
      name: constants.snapshots.name
    }
  })

}

module.exports = destroyDroplet