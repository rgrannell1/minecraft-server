
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

const beginShutdown = async () => {
  const credentials = btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`)

  const pauseRes = await fetch(`${constants.urls.api}/pause`, {
    method: 'POST',
    headers: {
      Authorization: credentials
    }
  })

  console.log(credentials)
  console.log('xxx')

  // -- todo; shutdown minecraft gracefully
  await execa('poweroff')
}

const handleInactiveState = async state => {
  let now = Date.now()

  let diffMs = now - state.lastActive
  let remainingSeconds = (constants.timers.shutdownMs - diffMs) / 1000

  const shutdownTime = remainingSeconds > 0
    ? Math.ceil(remainingSeconds / 60)
    : 'now'

  console.log(`${timestamp()}: server inactive; shutting down in ${shutdownTime} minutes`)

  if (diffMs > constants.timers.shutdownMs) {
    console.log(`${timestamp()}: server inactive; triggering deprovisioning`)

    await beginShutdown()
  }
}

const main = async () => {
  console.log('polling local server for user-counts')

  let serverData = await fetchServerData()

  if (!serverData) {
    console.log(`${timestamp()}: failed to connect to server`)
    await handleInactiveState(state)

  } else if (serverData.online && serverData.online > 0) {
    // -- server is active

    state.lastActive = Date.now()
    console.log(`${timestamp()}: server active with ${serverData.online} players`)

  } else {
    // -- server is inactive
    await handleInactiveState(state)
  }

  setTimeout(async () => {
    await main()
  }, 15000)
}

command.task = async () => {
  await main()
}

module.exports = command
