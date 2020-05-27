
const fetch = require('node-fetch')
const constants = require('../commons/constants')

const api = {}

/**
 * List OS images available on DigitalOcean
 *
 * @param {Object} client the digitalocean client
 *
 * @returns {Array<object>} A list of ubuntu images
 */
api.listUbuntuImages = async client => {
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

/**
 * List OS images available on DigitalOcean
 *
 * @param {Object} client the digitalocean client
 *
 * @returns {Array<object>} A list of ubuntu images
 */
api.getImage = async (slug, client) => {
  const images = await api.listUbuntuImages(client)

  return images.find(data => {
    return data.slug === slug
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

  const { action } = await res.json()
  return action
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

api.listSSHKeys = async client => {
  const res = await client({
    path: '/account/keys'
  })

  if (!res.ok) {
    throw res
  }

  const { ssh_keys } = await res.json()
  return ssh_keys
}

api.getSSHKey = async (name, client) => {
  const keys = await api.listSSHKeys(client)

  return keys.find(data => {
    return data.name === name
  })
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

  const resBody = await res.json()
  const { droplet } = resBody

  if (!droplet) {
    throw new Error('response did not return "droplet" property.')
  }

  return droplet
}

api.updateSnapshot = async () => { }

api.shutdownDroplet = async () => { }

api.listFloatingIps = async client => {
  const res = await client({
    path: '/floating_ips'
  })

  if (!res.ok) {
    throw res
  }

  const { floating_ips } = await res.json()
  return floating_ips
}

api.getDropletFloatingIp = async (dropletId, client) => {
  const ips = await api.listFloatingIps(client)

  return ips.find(data => {
    return data.droplet && data.droplet.id === dropletId
  })
}

api.assignFloatingIp = async (floatingIp, droplet, client) => {
  const ip = floatingIp.ip
  const body = {
    type: 'assign',
    droplet_id: droplet.id,
  }

  const res = await client({
    method: 'POST',
    path: `/floating_ips/${ip}/actions`,
    body
  })

  if (!res.ok) {
    throw res
  }

  const { action } = await res.json()
  return action
}

api.reserveFloatingIp = async (droplet, client) => {
  const body = { }

  if (droplet) {
    body.droplet_id = droplet.id
  } else {
    body.region = 'nyc'
  }

  const res = await client({
    method: 'POST',
    path: '/floating_ips',
    body
  })

  if (!res.ok) {
    throw res
  }

  const { floating_ip } = await res.json()
  return floating_ip
}

api.restoreDroplet = async (droplet, snapshot, client) => {
  if (!droplet) {
    throw new Error('no droplet supplied.')
  }

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

  const { action } = await res.json()
  return action
}

api.dropletIp = async (name, client) => {
  const droplet = await api.getDroplet(name, client)
  console.log(droplet.networks)
}

api.deleteDroplet = async (droplet, client) => {
  const res = await client({
    method: 'DELETE',
    path: `/droplets/${droplet.id}`
  })

  if (!res.ok) {
    throw res
  }
}

api.startDroplet = async (droplet, client) => {
  const body = {
    type: 'power_on',
  }

  const res = await client({
    method: 'POST',
    path: `/droplets/${droplet.id}/actions`,
    body
  })

  if (!res.ok) {
    throw res
  }

  const { action } = await res.json()
  return action
}

/**
 * Create a shallow wrapper around fetch to make requests to digitalocean
 *
 * @param {string} token the digitalocean token
 *
 * @returns {function} a fetch API wrapper
 */
api.client = token => ({ method = 'GET', path, headers, body }) => {
  const url = path.startsWith('/')
    ? `${constants.urls.digitalocean}${path}`
    : `${constants.urls.digitalocean}/${path}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  return fetch(url, {
    ...config,
    method,
  })
}

module.exports = api
