
const pulp = require('@rgrannell/pulp')

const commands = require('./commands/index.js')

const tasks = pulp.tasks()

tasks.addAll(commands)
tasks.run().catch(err => {
  console.log(err)
  process.exit(1)
})
