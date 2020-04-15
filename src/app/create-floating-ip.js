
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')
const utils = require('../commons/utils')


const assignFreeIp = async (freeIp, droplet, client) => {
  console.log(chalk.blue(`Assigning free ip ${freeIp.ip} to Droplet`))

  let retry = 5
  while (retry >= 0) {
    try {
      const assignAction = await api.assignFloatingIp(freeIp, droplet, client)
    } catch (err) {
      if (retry <= 0) {
        throw err
      } else {
        console.log(chalk.yellow('Failed to assign IP address, retrying...'))

        await utils.stall(constants.stalls.assignIp)
      }
    }

    retry--
  }
}

const assignReservedIp = async (droplet, client) => {
  console.log(chalk.blue(`Reserving IP address for Droplet`))

  let retry = 5
  while (retry >= 0) {
    try {
      const floatingIp = await api.reserveFloatingIp(droplet, client)

      console.error(`created floating IP ${floatingIp.ip}.`)
    } catch (err) {
      if (retry <= 0) {
        throw err
      } else {
        console.log(chalk.yellow('Failed to reserve IP address, retrying...'))

        await utils.stall(constants.stalls.reserveIp)
      }
    }

    retry--
  }
}

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
    await assignFreeIp(freeIp, droplet, client)
  } else {
    await assignReservedIp(droplet, client)
  }
}

module.exports = createFloatingIp
