
const constants = require('../commons/constants')

const api = {}

api.listImages = async client => {
  const res = await client({
    path: '/images?type=distribution'
  })

  if (!res.ok) {
    throw res
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

  if (!res.ok) {
    throw res
  }

  const { droplets } = await res.json()
  return droplets
}

api.getDroplet = async (name, client) => {
  const droplets = await api.listDroplets(client)

  return droplets.find(droplet => {
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

  if (!res.ok) {
    throw res
  }

}

api.listSnapshots = async (client) => {
  const res = await client({
    path: `/snapshots?resource_type=droplet`
  })

  if (!res.ok) {
    throw res
  }

  const { snapshots } = await res.json()
  return snapshots
}

api.listKeys = async client => {
  const res = await client({
    path: '/account/keys'
  })

  if (!res.ok) {
    throw res
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


  const res = await client({
    method: 'POST',
    path: '/droplets',
    body
  })

  if (!res.ok) {
    throw res
  }

  return res
}

api.updateSnapshot = async () => {

}

api.shutdownVM = async () => {

}

api.restoreDroplet = async (droplet, snapshot, client) => {
  const body = {
    type: 'restore',
    image: snapshot.id
  }

  const res = await client({
    method: 'POST',
    path: `/droplets/${droplet.id}/actions`,
    body
  })

  if (!res.ok) {
    throw res
  }

  return res
}

module.exports = api
