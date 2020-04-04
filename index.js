
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
  while (true) {
    await stall(60 * 1000)

    const data = await fetchData()

    if (data.online && data.online > 0) {
      lastActive = Date.now()

      console.log(`server active with ${data.online} players`)

    } else {
      console.error('shutting down server soon!')
    }

    console.log(data)
  }
}

main()
