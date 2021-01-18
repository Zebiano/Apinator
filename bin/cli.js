// Requires: Packages
const write = require('write')

// Requires: Libs
const inquirer = require('../lib/inquirer')
const echo = require('../lib/echo')
const generate = require('../lib/generate')

// Require: Templates
const controller = require('../templates/src/project/components/controller')

// Main
exports.main = async function (meow) {
    // console.log(meow)

    // Generate foundation
    if (meow.flags.new) return await generate.foundation(meow.pkg.apinator)

    // If nothing happens, I'm assuming the user ran without flags
    echo.error('Missing arguments.')
    echo.tip('Use -h for help.')
    echo.info('Running version ' + meow.pkg.version + '.', true)
}

/* --- Functions --- */
