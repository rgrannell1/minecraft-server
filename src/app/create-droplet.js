
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')

const recreateDroplet = async client => {
  const exists = await api.dropletExists(constants.vms.name, client)

  if (exists) {
    console.log(chalk.blue('VM already exists'))
    // -- todo check config matches, idempotent update
  } else {
    console.log(chalk.red('VM does not exist'))

  }
}

module.exports = recreateDroplet
