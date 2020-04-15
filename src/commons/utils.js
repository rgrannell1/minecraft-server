
const utils = {}

utils.stall = num => {
  return new Promise(resolve => {
    setTimeout(resolve, num)
  })
}

module.exports = utils
