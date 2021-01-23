// Requires: Packages
const inquirer = require('inquirer');

// Input
exports.input = function (msg) {
    return inquirer.prompt({
        type: 'input',
        name: 'input',
        message: msg
    })
}

// List
exports.list = function (msg, choices) {
    return inquirer.prompt({
        type: 'list',
        name: 'list',
        message: msg,
        choices: choices
    })
}

// Confirm
exports.confirm = function (msg) {
    return inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: msg,
        default: false
    })
}
