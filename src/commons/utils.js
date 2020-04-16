
const utils = {}

/**
 * Stall the program for a set number of milliseconds
 *
 * @param {number} num the time to stall for
 *
 * @returns {Promise<undefined>}
 */
utils.stall = num => {
  return new Promise(resolve => {
    setTimeout(resolve, num)
  })
}

module.exports = utils
