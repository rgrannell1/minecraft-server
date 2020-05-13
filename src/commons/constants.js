
const path = require('path')

/**
 * The program-wide constant object
 */
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
    assignIp: 5000,
    reserveIp: 5000,
    ssh: 5000
  },
  retries: {
    assignIp: 25,
    ssh: 5
  },
  os: {
    ubuntu: 'ubuntu-16-04-x64'
  },
  sshKeys: {
    shared: 'shared-minecraft'
  },
  zeitEnvVariables: [
    'TOKEN',
    'BASIC_AUTH_USER',
    'BASIC_AUTH_PASS'
  ]
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
