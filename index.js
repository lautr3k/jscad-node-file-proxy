const Cache = require('./libs/Cache')
const Proxy = require('./libs/Proxy')
const getFile = require('./libs/getFile')

function server (settings) {
  settings = Object.assign({ cache: {}, proxy: {} }, settings || {})

  const cache = new Cache(settings.cache)

  function onListen () {
    console.log('Proxy server listening on http://' + this.ip + ':' + this.port)
    console.log('Cache lifetime:', cache.lifetime / 1000, 'seconds')
    console.log('Cache path    :', cache.path)
  }

  function onRequest (req, res) {
    // Extract requested url
    const url = req.url.slice(1).replace(/^\?uri=/, '')
    console.log('\nGET:', url)

    // Error callback
    const onError = error => {
      console.log('ERROR:', error)
      res.end('ERROR: ' + error)
    }

    getFile(url, (error, response, body) => {
      // Sync response status code
      res.status(response.statusCode)

      if (error) {
        return onError(error)
      }

      const payload = cache.writeFile(response.request.href, body)

      console.log('CACHED:', payload.file)
      res.end(JSON.stringify(payload))
    })
  }

  return new Proxy(Object.assign({ onListen, onRequest }, settings.proxy))
}

module.exports = server
