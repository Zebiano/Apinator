// Requires: Packages
const conf = require('conf')
const ora = require('ora')

// Requires: Libs
const echo = require('../lib/echo')
const generate = require('../lib/generate')

// Variables
const config = new conf()
const spinner = ora()

// Main
exports.main = async function (meow) {
    // console.log(meow.input)
    // console.log(meow.flags)

    // Set current project in conf
    if (!config.get(process.env.PWD)) config.set(process.env.PWD, {})

    // Create apinator object
    let apinator = createApinator(meow)

    // Check first input
    switch (meow.input[0]) {
        // Foundation
        case 'create':
        case 'new':
        case 'foundation':
            // Variables
            let countExit = 0
            // Generate Foundation
            await generate.foundation(apinator, spinner, meow)
            process.on('beforeExit', async () => { // This freaking line is only here because of the spinner
                if (meow.input[1] && countExit == 0) {
                    // Generate App
                    await generate.app(apinator, spinner, meow)
                    // Increment
                    countExit++
                } else if (countExit == 1) config.set(process.env.PWD + '.hasBeenGenerated', true)
            })
            break
        // App
        case 'app':
            // Generate App
            await generate.app(apinator, spinner, meow)
            break
        // Module
        case 'module':
            // Generate Module
            await generate.module(apinator)
            break
        // If nothing happens, I'm assuming the user ran without flags
        default:
            echo.error('Missing arguments.')
            echo.tip('Use -h for help.')
            echo.info('Running version ' + meow.pkg.version + '.')
            break
    }
}

/* --- Functions --- */
// Creates the apinator object
function createApinator(meow) {
    // Variables
    let object = {}

    // Set every property defined in package.json
    if (meow.pkg.apinator != undefined) object = meow.pkg.apinator

    // Check if property exists, and if not, assign default values
    if (!object.overwrite) object.overwrite = false

    // Return
    return object
}
