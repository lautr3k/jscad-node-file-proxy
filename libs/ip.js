const networkInterfaces = require('os').networkInterfaces()

function ip () {
  let address = '127.0.0.1'

  Object.keys(networkInterfaces).forEach(interface => {
    networkInterfaces[interface].filter(details => {
      if (details.family === 'IPv4' && details.internal === false) {
        address = details.address
      }
    })
  })

  return address
}

module.exports = ip
