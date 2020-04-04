
const MinecraftQuery = require('minecraft-query')
const psList = require('ps-list')
const dayjs = require('dayjs')

const constants = {
  timers: {
    shutdownMs: 20 * 60 * 1000
  }
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

const fetchData = async () => {
  const query = new MinecraftQuery({
    host: '0.0.0.0',
    port: 25565,
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

const main = async () => {
  console.log('polling local server for user-counts')

  let serverData = await fetchData()
  let now = Date.now()

  if (!serverData) {

    console.log(`${timestamp()}: failed to connect to server`)

    const tasks = await psList()
    console.log(tasks.map(d => d.name))

  } else if (serverData.online && serverData.online > 0) {

    state.lastActive = Date.now()
    console.log(`${timestamp()}: server active with ${serverData.online} players`)

  } else {

    let diffMs = now - state.lastActive
    let remainingSeconds = (constants.timers.shutdownMs - diffMs) / 1000

    console.log(`${timestamp()}: server inactive; shutting down in ${remainingSeconds} seconds`)

    if (diffMs > constants.timers.shutdownMs) {
      console.log(`${timestamp()}: server inactive; shutting down NOW`)
    }
  }

  setTimeout(() => main(), 15000)
}

main()
