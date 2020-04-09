

const recreateDroplet = async client => {
  const res = await client({
    path: '/droplets'
  })

  const droplets = await res.json()

  // find
}

module.exports = recreateDroplet
