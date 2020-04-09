
const api = {}

api.listDroplets = async client => {
  const res = await client({
    path: '/droplets'
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

  const { droplets } = await res.json()
  return droplets
}

api.dropletExists = async (name, client) => {
  const droplets = await api.listDroplets(client)

  return droplets.some(droplet => {
    return droplet.name === constants.vms.name
  })
}

api.createDroplet = async () => {

}

api.updateSnapshot = async () => {

}

api.shutdownVM = async () => {

}

module.exports = api
