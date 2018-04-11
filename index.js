const networkInterfaces = require('os').networkInterfaces()
const minimist = require('minimist')
const express = require('express')
const request = require('request')
const uuid = require('uuid/v4')
const path = require('path')
const fs = require('fs')

// Create express application
const app = express()

// Arguments parser & help
const argv = minimist(process.argv.slice(2))

if (argv.h || argv.help) {
  return console.log(`
    jscad-node-file-proxy v0.1.0
    ----------------------------------------
    -p, --port      server port
    -c, --cache     cache directory path
    -t, --lifetime  file lifetime in seconds
    -h, --help      print this help
  `)
}

// Configuration
const port = argv.p || argv.port || 8888
const cachepath = argv.c || argv.cache || './cache'
const lifetime = argv.t || argv.lifetime || 60

// Create cache path if doesn't exist
if (!fs.existsSync(cachepath)){
  fs.mkdirSync(cachepath)
}

// Try to get the server local address
let address = '127.0.0.1'

Object.keys(networkInterfaces).forEach(interface => {
  networkInterfaces[interface].filter(details => {
    if (details.family === 'IPv4' && details.internal === false) {
      address = details.address
    }
  })
})


// Catch all requests
app.get('*', function (req, res) {
  // Access control headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')

  if (req.method === 'OPTIONS') {
    res.send() // CORS Preflight
  } else {
    // Extract requested url
    let url = req.url.slice(1).replace(/^\?uri=/, '')

    // Skip favicon
    if (url === 'favicon.ico') {
      return
    }

    // Debug message
    console.log('\nGET:', url)

    // Error callback
    const onError = error => {
      console.log('ERROR:', error)
      res.end('ERROR: ' + error)
    }

    // Forward the request (encoding: null => body as Buffer)
    request(url, { encoding: null }, (error, response, body) => {
      // HTTP error
      if (response.statusCode !== 200) {
        error = response.statusCode + ' ' + response.statusMessage
      }

      // HTTP or Netowork error
      if (error) {
        return onError(error)
      }

      // Compute payload with the real url (after redirect)
      const realurl = response.request.href
      const filename = path.basename(realurl)
      const cachename = uuid() + '-' + filename
      const file = path.join(cachepath, cachename)
      const payload = { filename, file, url: realurl }

      try {
        // Write the temp file in the cache
        fs.writeFileSync(file, body)
      } catch (error) {
        return onError(error)
      }

      // Send the payload
      console.log('PAYLOAD:', payload)
      res.end(JSON.stringify(payload))

      // Delay file remove
      setTimeout(() => {
        fs.unlinkSync(file)
        console.log('REMOVED:', file)
      }, 1000 * lifetime)
    })
  }
})

// Start listening
app.listen(port, () => {
  console.log('Proxy server listening on http://', address, ':', port)
  console.log('Cache path:', fs.realpathSync(cachepath))
  console.log('Cache lifetime:', lifetime, 'seconds')
})
