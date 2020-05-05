
const api = require('../commons/api')
const log = require('../commons/log')

const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()

const tests = {}

tests.filesPresent = async () => {
  const result = await ssh.execCommand('cat /var/lib/cloud/data/status.json', { cwd: '/usr' })

  var status
  try {
    status = JSON.parse(result.stdout)
  } catch (err) {
    throw new Error('failed to parse result as json')
  }

  let failed = false

  const errorSections = status?.v1 || []

  for (const section of Object.values(errorSections)) {
    for (const data of (section?.errors || [])) {
      if (!failed) {
        log.error('cloud-init failures detected:')
      }
      failed = true

      log.error(data)
    }
  }

  if (failed) {
    log.error('cloud-init initialisation failed')
  }
}

const validateInstall = async (host, passphrase, client) => {
  if (!host) {
    throw new Error('no host provided')
  }

  await ssh.connect({
    host,
    username: 'root',
    privateKey: 'data/minecraft',
    passphrase
  })

  await tests.filesPresent()
}

module.exports = validateInstall
