
const postStart = () => {
  if (req.method !== 'POST') {
    throw errors.methodNotAllowed('Only POST method supported', 405)
  }

}

module.exports = (req, res) => {
  console.log(`${req.method} ${req.path}`)

  try {
    postStart(req, res)
  } catch (err) {
    utils.handleErrors(err, res)
  }
}
