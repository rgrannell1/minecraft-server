
const path = require('path')

const constants = {
  paths: {
    env: path.resolve(path.join(__dirname, '../../.env'))
  },
  urls: {
    digitalocean: 'https://api.digitalocean.com/v2'
  }
}

module.exports = constants
