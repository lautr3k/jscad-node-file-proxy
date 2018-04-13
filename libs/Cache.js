const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v4')

// Default settings
Cache.DEFAULTS = {
  path: './cache',  // cache path
  lifetime: 60,     // file lifetime
  init: true,       // auto init cache
  useTimeout: true  // delay file remove with setTimeout
}

// Cache class...
function Cache (settings) {
  // Merge defaults and user settings
  settings = Object.assign(Cache.DEFAULTS, settings || {})

  // Set properties
  this.path = settings.path
  this.lifetime = settings.lifetime * 1000
  this.useTimeout = settings.useTimeout

  // Auto init cache
  settings.init && this.init()
}

Cache.prototype = {
  // Initialize the cache
  init: function () {
    this.makePathIfNotExists()
    this.removeExpiredFiles()
  },

  // Make the cache directory if does not exists
  makePathIfNotExists: function () {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path)
    }
  },

  // Remove all expired files from cache path
  removeExpiredFiles: function () {
    fs.readdirSync(this.path).forEach((file, index) => {
      const cache = path.join(this.path, file)
      const stat = fs.statSync(cache)
      const ctime = new Date(stat.ctime).getTime()
      const now = new Date().getTime()

      if (now - ctime >= this.lifetime) {
        //console.log('REMOVE:', cache)
        fs.unlinkSync(cache)
      }
    })
  },

  // Write file/data in the cache
  writeFile: function (url, data) {
    // Make an unique file path
    const basename = path.basename(url)
    const file = path.join(this.path, uuid() + '.' + basename)

    // Write the file
    fs.writeFileSync(file, data)

    // Delay file remove
    if (this.useTimeout) {
      setTimeout(() => fs.unlinkSync(file), this.lifetime)
    }

    // Return cached file payload
    return { url, basename, file }
  }
}

module.exports = Cache
