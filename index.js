
const MinecraftQuery = require('minecraft-query')

const fetchData = async () => {
  const query = new MinecraftQuery({
    host: '0.0.0.0',
    port: 25565,
    timeout: 10000
  })

  try {
    const data = await query.basicStat()
    query.close()
    return data
  } catch (err) {
    console.error(`failed to retrieve stats from server.\n`)
    console.error(err.message)
    query.close
  }
}

const main = async () => {
  const data = await fetchData()

  console.log(data)
}

main()
