const config = require('config')
const Koop = require('@koopjs/koop-core')
const cache = require('@koopjs/cache-memory')
const routes = require('./routes')
const plugins = require('./plugins')
const fs = require('fs')
const path = require('path')
const https = require('https')


/**
 * self signed cert options
 * to generate self signed cert:
 * ```sh 
 * openssl req -x509 -newkey rsa:2048 -nodes -keyout cert/key.pem -out cert/cert.pem
 * ```
 */ 
const serverOptions = {
  key: fs.readFileSync(path.resolve('../cert/key.pem')),
  cert: fs.readFileSync(path.resolve('../cert/cert.pem')),
  requestCert: true,
  rejectUnauthorized: false
};

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


// run SSL with self signed cert in dev mode
const server = process.env.NODE_ENV !== 'development'
  ? https
    .createServer(
      serverOptions,
      koop.server
    )
  : koop.server

// start the server
server.listen(config.port, () => koop.log.info(`Koop server listening at ${config.port}`))
