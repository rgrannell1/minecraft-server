
const MinecraftQuery = require('minecraft-query')
const psList = require('ps-list')
const dayjs = require('dayjs')

const {exec} = require('child_process')

const constants = {
  timers: {
    shutdownMs: 20 * 60 * 1000
  },
  host: '0.0.0.0',
  port: 25565
}

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

  console.log(`${timestamp()}: server inactive; shutting down in ${remainingSeconds / 60} minutes`)

  if (diffMs > constants.timers.shutdownMs) {
    console.log(`${timestamp()}: server inactive; shutting down NOW`)

    exec('shutdown now', (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      process.stdout.pipe(stdout)
      process.stderr.pipe(stderr)
    })
  }
}

const main = async () => {
  console.log('polling local server for user-counts')

  // -- todo check if server is online
  const tasks = await psList()
  //console.log(tasks.map(d => d.name))

  let serverData = await fetchServerData()

  if (!serverData) {
    // -- could not retrieve query data

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

main()
