
const {docopt} = require('docopt')
const minecraftServer = require('../app/minecraft-server')

const docs = `
Usage:
  mineserver create
  mineserver destroy
`

const args = docopt(docs)

minecraftServer(args)
  .catch(err => {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
  })
