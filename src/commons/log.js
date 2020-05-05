
const chalk = require('chalk')

const log = {}

log.error = message => {
  console.error(chalk.red(message))
}

log.warning = message => {
  console.error(chalk.yellow(message))
}

log.success = message => {
  console.error(chalk.blue(message))
}

module.exports = log
