const welcome = require('./request-handlers/welcome')

module.exports = [
  {
    path: '/open-brewery/breweries/metadata',
    methods: ['get'],
    handler: welcome
  }
]
