exports.generate = function () {
    return `
// Require: Packages
const express = require('express')
const app = express()

// Require: Helper
const echo = require('./helper/echo')

// Middleware
app.use(express.json())

// Export app
module.exports = { app: app }

// Require: Routes
const routes = require('./routes.json')
for (i of routes) app.use(i.path, require(i.file))

// Act depending on the environment
switch (process.env.ENV) {
    case 'production':
        break
    case 'local':
        // Require: Database
        require('./database')

        // Start app
        app.listen(process.env.APP_PORT, function () {
            echo.info('Running app at http://localhost:' + process.env.APP_PORT)
        })

        // Break
        break
    case 'test':
        // Warn
        echo.warn('Not starting app because of test environment.')

        // Break
        break
    default:
        console.log('Unknown environment.')
        break
}    
`.trim()
}
