// Requires: Packages
const chalk = require('chalk')

/* --- Functions --- */
// Info
function info(msg, exit) {
    console.log(chalk.blue.bold("Info: ") + msg)
    if (exit) process.exit()
}

// Tip
function tip(msg, exit) {
    console.log(chalk.green.bold("Tip: ") + msg)
    if (exit) process.exit()
}

// Success
function success(msg, exit) {
    console.log(chalk.green.bold("Success: ") + msg)
    if (exit) process.exit()
}

// Warning
function warning(msg, exit) {
    console.log(chalk.yellow.bold("Warning: ") + msg)
    if (exit) process.exit()
}

// Abort
function abort(msg, exit) {
    console.log(chalk.red.bold("Abort: ") + msg)
    if (exit) process.exit()
}

// Error
function error(msg, exit) {
    console.log(chalk.red.bold("Error: ") + msg)
    if (exit) process.exit()
}

// Exports
module.exports = {
    info: info,
    success: success,
    warning: warning,
    error: error,
    tip: tip,
    abort: abort
}