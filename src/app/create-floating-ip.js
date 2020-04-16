
const api = require('../commons/api')
const constants = require('../commons/constants')
const chalk = require('chalk')
const utils = require('../commons/utils')

/**
 * Assign a currently free IP address ti a drioket
 *
 * @param {object} freeIp a free IP address
 * @param {object} droplet a droplet
 * @param {object} client the API client
 */
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
        console.log(chalk.yellow(`Failed to assign IP address, retrying in ${constants.stalls.assignIp}ms...`))

        await utils.stall(constants.stalls.assignIp)
      }
    }

    retry--
  }
}

/**
 * Handle errors that occur when assigning a reserved IP address.
 *
 * @param {Error | Response} err
 * @param {num} retry the current number of remaining retries
 *
 * @throws {Exception}
 */
const handleReservedIpError = async (err, retry) => {
  if (retry <= 0) {
    throw err
  } else {
    console.log(chalk.yellow(`Failed to reserve IP address, retrying in ${constants.stalls.reserveIp}ms...`))
    await utils.stall(constants.stalls.reserveIp)
  }
}

/**
 * Assign a reserved IP address to a droplet. If this fails, it will be retried a
 * set number of times.
 *
 * @param {object} droplet a droplet
 * @param {object} client a client
 *
 * @returns {undefined}
 */
const assignReservedIp = async (droplet, client) => {
  console.log(chalk.blue(`Reserving IP address for Droplet`))

  let retry = 5
  while (retry >= 0) {
    try {
      const floatingIp = await api.reserveFloatingIp(droplet, client)
      console.log(`created floating IP ${floatingIp.ip}.`)

    } catch (err) {
      await handleReservedIpError(err, retry)
    }

    retry--
  }
}

/**
 * Create or assign a floating IP address to a Droplet
 *
 * @param {object} droplet a droplet
 * @param {object} client a client
 *
 * @returns {undefined}
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
