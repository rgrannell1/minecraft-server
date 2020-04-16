
const {docopt} = require('docopt')
const minecraftServer = require('../app/minecraft-server')
const chalk = require('chalk')

const docs = `
Usage:
  mineserver create
  mineserver destroy
`

const args = docopt(docs)

/**
 * Handle CLI errors
 *
 * @param {Response | Error} err a thrown object
 *
 */
const handleError = async err => {
  if (err.stack) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
  } else if (err.status) {
    const body = await err.json()

    console.error(chalk.red(`${body.id}: ${body.message}`))
    process.exit(1)
  } else {
    console.error(err)
    process.exit(1)
  }
}

minecraftServer(args).catch(handleError)
