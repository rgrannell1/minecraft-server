
const SHUTDOWN_TIMER = 30 * 60 * 1000

const constants = {
  timers: {
    shutdownMs: 30 * 60 * 1000
  }
}

const MinecraftQuery = require('minecraft-query')

const parseData = data => {
  if (!data.hasOwnProperty('online_players')) {
    console.error('online_player data missing');

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
    console.error('failed to parse data')
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
    query.close()
    return parseData(data)
  } catch (err) {
    console.error(`failed to retrieve stats from server.\n`)
    console.error(err.message)
    query.close
  }
}

const stall = num => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, num)
  })
}

let lastActive = Date.now()

const main = async () => {
  console.log('polling local server for user-counts')

  while (true) {
    let data = await fetchData()
    let now = Date.now()

    if (data.online && data.online > 0) {
      lastActive = Date.now()

      console.log(`server active with ${data.online} players`)
    } else {
      let diffMs = now - lastActive
      let remainingSeconds = (constants.timers.shutdownMs - diffMs) / 1000

      console.log(`server inactive; shutting down in ${remainingSeconds} seconds`)

      if (diffMs > constants.timers.shutdownMs) {
        console.log(`server inactive; shutting down NOW`)
      }
    }

    await stall(30 * 1000)
  }
}

main()
