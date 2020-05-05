
const api = require('../commons/api')
const constants = require('../commons/constants')
const log = require('../commons/log')
const utils = require('../commons/utils')

/**
 * Assign a currently free IP address to a droplet
 *
 * @param {object} freeIp a free IP address
 * @param {object} droplet a droplet
 * @param {object} client the API client
 */
const assignFreeIp = async (freeIp, droplet, client) => {
  log.success(`Assigning free ip ${freeIp.ip} to Droplet`)

  let retry = constants.retries.assignIp
  while (retry >= 0) {
    try {
      const dropletIp = await api.getDropletFloatingIp(droplet.id, client)
      if (dropletIp) {
        log.success(`Droplet has IP address ${dropletIp.ip}`)
        return assertReturn(dropletIp)
      }
    } catch (err) {
      if (retry <= 0) {
        throw err
      } else {
        log.warning(`Failed to list IP addresses`)
      }
    }

    try {
      const assignAction = await api.assignFloatingIp(freeIp, droplet, client)

      return freeIp.ip
    } catch (err) {
      if (retry <= 0) {
        throw err
      } else {
        log.warning(`Failed to assign IP address, retrying in ${constants.stalls.assignIp}ms...`)

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
  if (err.message.includes('assigned')) {
    return
  }
  if (retry <= 0) {
    throw err
  } else {
    log.warning(`Failed to reserve IP address, retrying in ${constants.stalls.reserveIp}ms...`)
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
  log.success(`Reserving IP address for Droplet`)

  let retry = constants.retries.assignIp
  while (retry >= 0) {
    try {
      const dropletIp = await api.getDropletFloatingIp(droplet.id, client)
      if (dropletIp) {
        log.success(`Droplet has IP address ${dropletIp.ip}`)
        return assertReturn(dropletIp.ip)
      }
    } catch (err) {
      if (retry <= 0) {
        throw err
      } else {
        log.warning(`Failed to list IP addresses`)
      }
    }

    try {
      const floatingIp = await api.reserveFloatingIp(droplet, client)
      console.log(`created floating IP ${floatingIp.ip}.`)

      return assertReturn(floatingIp.ip)
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

const assertReturn = val => {
  if (!val) {
    throw new Error('no value provided.')
  }
  return val
}

const createFloatingIp = async (droplet, client) => {
  const ips = await api.listFloatingIps(client)

  const assignedIp = ips.find(data => {
    return data.droplet && data.droplet.id === droplet.id
  })

  const ip = assignedIp?.ip
  if (ip) {
    log.success(`Droplet is assigned floating-ip ${ip}`)
    return assertReturn(ip)
  }

  const freeIp = ips.find(data => {
    return data.droplet === null
  })

  if (freeIp) {
    return assignFreeIp(freeIp, droplet, client)
  } else {
    return assignReservedIp(droplet, client)
  }
}

module.exports = createFloatingIp
