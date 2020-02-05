// Requires: Packages
const minimist = require('minimist');

// Requires: Files
const inquirer = require('../lib/inquirer')

// Variables
const argv = minimist(process.argv.slice(2));
console.log(argv)
console.log(argv._[0])

// Command picker
switch (argv._[0]) {
    case "create":
        console.log("Create!")
        break
    case "module":
        console.log("Module!")
        break
    default:
        console.log("Something else...")
}

/* --- Functions --- */
// Creates a new API
function create() {
    // Hm.
}

// Exports
module.exports = {
    create: create()
}