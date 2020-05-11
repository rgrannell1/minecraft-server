
const MinecraftQuery = require('minecraft-query')
const psList = require('ps-list')
const dayjs = require('dayjs')
const fetch = require('node-fetch')

const constants = require('../shared/constants')

const { exec } = require('child_process')

const command = {
  name: 'deprovision'
}

command.cli = `
Usage:
  script deprovision
Description:
  Deprovision the server.
`

const timestamp = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const parseData = data => {
  if (!data.hasOwnProperty('online_players')) {
    console.error(`${timestamp}: online_player data missing`)

    return {
      online: null
    }
  }

  try {
    const parsed = parseInt(data.online_players, 10)

    if (parsed === parsed) {
      return {
        online: parsed
      }
    } else {
    }
  } catch (err) {
    console.error(`${timestamp()}: failed to parse data`)
    console.error(err.message)
  }

  return {
    online: null
  }
}

const fetchServerData = async () => {
  const query = new MinecraftQuery({
    host: constants.host,
    port: constants.port,
    timeout: 10000
  })

  try {
    const data = await query.basicStat()
    await query.close()
    return parseData(data)
  } catch (err) {
    console.error(`${timestamp()}: failed to retrieve stats from server.\n`)
    console.error(err.message)
    await query.close()
  }
}

const state = {
  lastActive: Date.now()
}

const handleInactiveState = state => {
  let now = Date.now()

  let diffMs = now - state.lastActive
  let remainingSeconds = (constants.timers.shutdownMs - diffMs) / 1000

  console.log(`${timestamp()}: server inactive; shutting down in ${Math.ceil(remainingSeconds / 60)} minutes`)

  if (diffMs > constants.timers.shutdownMs) {
    console.log(`${timestamp()}: server inactive; triggering deprovisioning`)

    exec('poweroff', (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      process.stdout.pipe(stdout)
      process.stderr.pipe(stderr)
    })
  }
}

command.task = async () => {
  process.getuid()

  console.log('polling local server for user-counts')

  const tasks = await psList()

  let serverData = await fetchServerData()

  if (!serverData) {
    console.log(`${timestamp()}: failed to connect to server`)
    handleInactiveState(state)

  } else if (serverData.online && serverData.online > 0) {
    // -- server is active

    state.lastActive = Date.now()
    console.log(`${timestamp()}: server active with ${serverData.online} players`)

  } else {
    // -- server is inactive
    handleInactiveState(state)
  }

  setTimeout(() => main(), 15000)
}

module.exports = command
