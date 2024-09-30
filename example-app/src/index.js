const config = require('config')
const Koop = require('@koopjs/koop-core')
const cache = require('@koopjs/cache-memory')
const routes = require('./routes')
const plugins = require('./plugins')

// initiate a koop app
const koop = new Koop()

// register koop plugins
plugins.forEach((plugin) => {
  koop.register(plugin.instance, plugin.options)
})

// register memory-cache
koop.register(cache, { size: 1000 })

// add additional routes
routes.forEach((route) => {
  route.methods.forEach((method) => {
    koop.server[method](route.path, route.handler)
  })
})

// start the server
koop.server.listen(config.port, () => koop.log.info(`Koop server listening at ${config.port}`))
