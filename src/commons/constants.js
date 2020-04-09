
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
  }
}

module.exports = constants
