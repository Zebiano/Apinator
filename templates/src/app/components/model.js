exports.generate = function (module) {
    return `
// Requires: Packages
const mongoose = require('mongoose')

// Model
const ${module.uppercase} = mongoose.model('${module.pluralUppercase}', new mongoose.Schema({
    // Your Mongo Schema
}, {
    collection: '${module.pluralUppercase}'
}))
// Exports
module.exports = ${module.uppercase}    
`.trim()
}
