exports.generate = function () {
    return `
// Require: Packages
const mongoose = require('mongoose')

// Require: Lib
const echo = require('./helper/echo')

// Require: Files
const config = require('./config')

// Fix deprecation warnings
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

// Connect
mongoose.connect('mongodb://' + process.env.DB_HOST + '/' + config.database.name)
mongoose.connection
    .on('error', function (err) { echo.error(err) })
    .once('open', function () { echo.success('Connected to DB') })
`.trim()
}
