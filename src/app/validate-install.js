
const api = require('../commons/api')
const log = require('../commons/log')
const constants = require('../commons/constants')

const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()

const tests = {}

tests.cloudInitStatus = async () => {
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
    process.exit(1)
  }
}

tests.minecraftStatus = async () => {
  log.warning('checking minecraft server status')

  const result = await ssh.execCommand('systemctl status minecraft.service --output json --no-page', { cwd: '/usr' })

  const records = result.stdout.split('\n').map(line => {
    const isJson = line.startsWith('{')

    if (isJson) {
      try {
        return JSON.parse(line)
      } catch (err) {
        return {}
      }
    } else {
      return {}
    }
  })

  const messages = records
    .map(record => record.MESSAGE)
    .filter(record => !!record)

  const failed = messages.some(message => {
    return message.includes('minecraft.service: Failed')
  })

  if (failed) {
    log.error('Minecaft server failed to start:')
    log.error(messages.map(message => `  ${message}`).join('\n'))
    process.exit(1)
  }
}

const validateInstall = async (host, passphrase, client) => {
  if (!host) {
    throw new Error('no host provided')
  }

  let error = null
  for (let retry = constants.retries.ssh; retry >= 0; --retry) {
    try {
      await ssh.connect({
        host,
        username: 'root',
        privateKey: 'data/minecraft',
        passphrase
      })

      log.success(`Connected to ${host} via SSH`)
      break
    } catch (err) {
      error = err
      log.warning(`Failed to connect to ${host}, retrying in ${constants.stalls.ssh}ms...`)

      await new Promise(resolve => {
        setTimeout(resolve, constants.stalls.ssh)
      })
    }

    if (retry === 0) {
      throw error
    }

  }

  await tests.cloudInitStatus()
  await tests.minecraftStatus()

  log.success(`${host} appears to be healthy & ready to use!`)
}

module.exports = validateInstall
