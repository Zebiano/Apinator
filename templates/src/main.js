exports.generate = function (projectName) {
    return `
// Require: Packages
require('dotenv').config()

// Require: APIs
require('./${projectName}/server')
`.trim()
}
