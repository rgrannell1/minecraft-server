
const MinecraftQuery = require('minecraft-query')

const constants = require('../shared/constants')

const command = {
  name: 'status'
}

command.cli = `
Usage:
  script status
Description:
  Get the server status.
`

command.task = async () => {
  try {
    var query = new MinecraftQuery({
      host: constants.host,
      port: constants.port,
      timeout: 10000
    })

    const data = await query.basicStat()
    await query.close()

    console.log({
      success: true,
      online: parseInt(data.online_players, 10)
    })
    process.exit(0)
  } catch (err) {
    console.error(`failed to retrieve stats from server.\n`)
    console.error(err.message)
    await query.close()

    console.log({
      success: false,
      online: null
    })
    process.exit(1)
  }
}

module.exports = command
