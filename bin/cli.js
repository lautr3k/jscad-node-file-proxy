#!/usr/bin/env node
const { name, version } = require('../package')
const minimist = require('minimist')
const server = require('../index')


// Parse command line arguments
const argv = minimist(process.argv.slice(2))

// Show help...
if (argv.h || argv.help) {
  return console.log(`
    ${name} - v${version}
    ----------------------------------------
    -p, --port      server port
    -c, --cache     cache directory path
    -t, --lifetime  file lifetime in seconds
    -h, --help      print this help
  `)
}

// Create proxy server
server({
  proxy: {
    port: argv.p || argv.port || 8888
  },
  cache: {
    path: argv.c || argv.cache || './cache',
    lifetime: argv.t || argv.lifetime || 60
  }
})
