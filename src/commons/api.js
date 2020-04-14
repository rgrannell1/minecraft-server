
const constants = require('../commons/constants')

const api = {}

api.listImages = async client => {
  const res = await client({
    path: '/images?type=distribution'
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

  const { images } = await res.json()
  return images.filter(data => {
    return data.distribution === 'Ubuntu'
  })
}


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

api.snapshot = async (id, snapshotName, client) => {
  const res = await client({
    path: `/droplets/${id}/actions`,
    body: {
      type: 'snapshot',
      name: snapshotName
    }
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

}

api.listSnapshots = async (client, { resourceType = 'droplet' }) => {
  const res = await client({
    path: `/snapshots?resource_type=${resourceType}`
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

  const { snapshots } = await res.json()
  return snapshots
}

api.listKeys = async client => {
  const res = await client({
    path: '/account/keys'
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

  const { ssh_keys } = await res.json()
  return ssh_keys
}

api.createDroplet = async (image, key, client) => {
  const body = {
    ...constants.vmConfig,
    image: image.id,
    ssh_keys: [key.id]
  }

  console.log(body)

  const res = await client({
    method: 'POST',
    path: '/droplets',
    body
  })

  if (res.status !== 200) {
    // THROW ERROR
  }

  const red = await res.json()
  console.log(red)
  return red
}

api.updateSnapshot = async () => {

}

api.shutdownVM = async () => {

}

module.exports = api
