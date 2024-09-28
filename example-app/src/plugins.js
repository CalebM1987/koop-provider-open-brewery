const openBrewery = require('../../build')
console.log(
  'openbrewery: ', openBrewery
)

// list different types of plugins in order
const outputs = []
const auths = []
const caches = []
const plugins = [
  {
    instance: openBrewery
  }
]

module.exports = [...outputs, ...auths, ...caches, ...plugins]
