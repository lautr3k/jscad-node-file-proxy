const request = require('request')

function getFile (url, callback) {
  request(url, { encoding: null }, (error, response, body) => {
    if (response.statusCode !== 200) {
      error = response.statusCode + ' ' + response.statusMessage
    }

    return callback(error, response, body)
  })
}

module.exports = getFile
