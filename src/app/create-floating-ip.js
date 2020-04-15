
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')

/**
 *
 * @param {*} client
 */
const createFloatingIp = async (droplet, client) => {
  const ips = await api.listFloatingIps(client)

  const freeIp = ips.find(data => {
    return data.droplet === null
  })

  if (freeIp) {
    api.assignFloatingIp(freeIp, droplet, client)
  } else {
    const res = await api.reserveFloatingIp(droplet, client)

    if (!res.ok) {
      throw res
    }

    const { floating_ip } = await res.json()

    console.error(`created floating IP ${floating_ip.ip}.`)
  }
}

module.exports = createFloatingIp
