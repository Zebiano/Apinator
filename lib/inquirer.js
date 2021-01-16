// Requires: Packages
const inquirer = require('inquirer');

/* --- Prompts --- */
// Color
const inputLabelColor = {
    type: 'input',
    name: 'color',
    message: 'Enter Label Color:',
    validate: function (value) {
        if (value.length && /^([A-Fa-f0-9]{6})$/.test(value)) {
            return true;
        } else {
            return 'Please enter a valid Hex color.';
        }
    },
    transformer: function (color) {
        return chalkPipe('#' + color)(color)
    }
}

// List for config
const listConfig = {
    type: 'list',
    name: 'choice',
    message: 'Which of the following do you want to update?',
    choices: [
        {
            name: 'Personal Access Token',
            value: 'token'
        },
        {
            name: 'Owner',
            value: 'owner'
        },
        {
            name: 'Repository',
            value: 'repository'
        },
        new inquirer.Separator(),
        {
            name: 'Exit Config',
            value: 'exit'
        },
    ]
}

// Confirm Repository
const confirmRepo = {
    type: 'confirm',
    name: 'updateRepo',
    message: 'It is NOT recommended to store repositories in the config as it is prone to mistakenly editing the wrong repository. Do you want to proceed?',
    default: false
}

/* --- Functions --- */

// Exports
module.exports = {
    
}
