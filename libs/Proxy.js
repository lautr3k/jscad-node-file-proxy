const express = require('express')
const ip = require('./ip')

// Default settings
Proxy.DEFAULTS = {
  port: 8888,
  autostart: true,
  onListen: () => {},
  onRequest: (req, res) => res.end()
}

// Proxy class...
function Proxy (settings) {
  // Merge defaults and user settings
  settings = Object.assign(Proxy.DEFAULTS, settings || {})

  // Set properties
  this.app = express()
  this.ip = ip()
  this.port = settings.port
  this.onListen = settings.onListen
  this.onRequest = settings.onRequest

  // Catch all requests
  this.app.get('*', (req, res) => {
    // Access control headers
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET')

    // CORS Preflight
    if (req.method === 'OPTIONS') {
      return res.send()
    }

    // Skip favicon.ico
    if (req.url.endsWith('favicon.ico')) {
      return res.status(404).end()
    }

    this.onRequest(req, res)
  })

  // Auto start proxy
  settings.autostart && this.start()
}

Proxy.prototype = {
  start: function () {
    this.app.listen(this.port, () => this.onListen())
  },

  stop: function () {
    this.app.close()
  }
}

module.exports = Proxy
