const welcome = require('./request-handlers/welcome')

module.exports = [
  {
    path: '/open-brewery/:id/metadata',
    methods: ['get'],
    handler: welcome
  }
]
