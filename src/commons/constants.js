
const path = require('path')

const constants = {
  paths: {
    env: path.resolve(path.join(__dirname, '../../.env'))
  },
  urls: {
    digitalocean: 'https://api.digitalocean.com/v2'
  },
  vms: {
    name: 'minecraft-server'
  },
  snapshots: {
    name: 'minecraft-snapshot'
  },
  stalls: {
    assignIp: 10000,
    reserveIp: 10000
  }
}

constants.vmConfig = {
  name: 'minecraft-server',
  region: 'nyc3',
  size: 's-1vcpu-1gb',
  backups: false,
  ipv6: false,
  user_data: null,
  private_networking: null,
  volumes: null,
  tags: [
    'minecraft'
  ]
}

module.exports = constants
