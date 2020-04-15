
const {docopt} = require('docopt')
const minecraftServer = require('../app/minecraft-server')

const docs = `
Usage:
  mineserver create
  mineserver destroy
`

const args = docopt(docs)

const handleError = err => {
  if (err.stack) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
  } else if (err.status) {
    console.log(err.text())
    console.log('-----------')
  } else {
    console.error(err)
    process.exit(1)
  }
}

minecraftServer(args).catch(handleError)
