// Requires: Packages
const inquirer = require('inquirer');

/* --- Prompts --- */
// Color
exports.inputNewProject = function () {
    return inquirer.prompt({
        type: 'input',
        name: 'inputNewProject',
        message: 'Project name:'
    })
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

// Current Workspace is 'apinator'
exports.confirmApinatorRepo = function () {
    return inquirer.prompt({
        type: 'confirm',
        name: 'confirmApinatorRepo',
        message: 'You seem to be working inside a directory called "apinator" without setting `ENV=local` inside the `.env` file. Are you sure you want to proceed?',
        default: false
    })
}
