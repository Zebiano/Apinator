exports.generate = function () {
    return `
// Require: Packages
require('dotenv').config()

// Require: Projects
const projects = require('./projects.json')
for (i of projects) require(i)
`.trim()
}
