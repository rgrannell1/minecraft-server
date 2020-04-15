
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')

/**
 *
 * @param {*} client
 */
const createFloatingIp = async (droplet, client) => {
  const ips = await api.listFloatingIps(client)

  const assignedIp = ips.find(data => {
    return data.droplet && data.droplet.id === droplet.id
  })

  if (assignedIp) {
    console.log(chalk.blue(`Droplet is assigned floating-ip ${assignedIp.ip}`))
    return
  }

  const freeIp = ips.find(data => {
    return data.droplet === null
  })

  if (freeIp) {
    console.log(chalk.blue(`Assigning free ip ${freeIp.ip} to Droplet`))

    api.assignFloatingIp(freeIp, droplet, client)
  } else {
    console.log(chalk.blue(`Reserving IP address for Droplet`))

    const res = await api.reserveFloatingIp(droplet, client)

    if (!res.ok) {
      throw res
    }

    const { floating_ip } = await res.json()

    console.error(`created floating IP ${floating_ip.ip}.`)
  }
}

module.exports = createFloatingIp
