// Requires: Packages
const write = require('write')
const fs = require('fs')
const shell = require('shelljs')
const https = require('https')

// Require: Libs
const inquirer = require('../lib/inquirer')
const echo = require('../lib/echo')

// Generate main project structure
exports.foundation = async function (config) {
    // Ask user for info
    const answer = await inquirer.inputNewProject()
    const projectName = answer.inputNewProject

    // Variables
    let placeholder = ''

    // Check for current workspace
    if (process.env.PWD.substring(process.env.PWD.lastIndexOf('/') + 1) == 'apinator' && process.env.ENV != 'local') {
        const answer = await inquirer.confirmApinatorRepo()
        if (answer.confirmApinatorRepo == true) echo.warn('Alright then, I hope you know what you\'re doing.')
        else process.exit()
    }
    else if (process.env.ENV == 'local') {
        placeholder = 'placeholder/'
        if (fs.existsSync(placeholder)) shell.rm('-rf', placeholder)
    }

    // Create files
    await dirRoot(config, placeholder, projectName) // Create files for /
    await dirSrc(config, placeholder, projectName) // Create files for src/
    await dirSrcProject(config, placeholder, projectName) // Create files for src/${projectName}/helper
    await dirSrcProjectHelper(config, placeholder, projectName) // Create files for src/${projectName}/helper
}

/* --- Functions --- */
// Creates a file if config.overwrite == true or if file does not already exist
async function createFile(config, path, template) {
    if ((config != undefined && config.overwrite) || !fs.existsSync(path))
        await write(path, template, { newline: true })
}

// Create files for /
async function dirRoot(config, placeholder, projectName) {
    // Require: Templates
    const tmpltEnv = require('../templates/env')

    // .env (This first to create possible placeholder location)
    await createFile(config, placeholder + '.env', tmpltEnv.generate('local', '3000', 'localhost/' + projectName))

    // Change directory if necessary
    shell.cd(placeholder)

    // npm init
    shell.exec('npm init -y')

    // npm i modules --save // TODO: Make this dynamic (add jest for example if configured)
    shell.exec('npm i chalk dotenv express mongoose --save', { async: true })

    // Change directory back
    shell.cd('..')

    // .gitignore
    let gitIgnoreFile = ''
    https.get('https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore', (res) => {
        res
            .on('data', (d) => { gitIgnoreFile += d })
            .on('end', async () => {
                if ((config != undefined && config.overwrite) || !fs.existsSync(placeholder + '.env'))
                    await write(placeholder + '.gitignore', gitIgnoreFile, { newline: true })
            })
    }).on('error', (e) => { console.error(e) })
}

// Create files for src/
async function dirSrc(config, placeholder, projectName) {
    // Require: Templates
    const tmpltMain = require('../templates/src/main')

    // src/main.js
    await createFile(config, placeholder + 'src/main.js', tmpltMain.generate(projectName))
}

// Create files for src/${projectName}
async function dirSrcProject(config, placeholder, projectName) {
    // Require: Templates
    const tmpltServer = require('../templates/src/project/server')
    const tmpltDatabase = require('../templates/src/project/database')

    // src/${projectName}/server.js
    await createFile(config, placeholder + `src/${projectName}/server.js`, tmpltServer.generate())

    // src/${projectName}/routes.json
    createFile(config, placeholder + `src/${projectName}/routes.json`, '')

    // src/${projectName}/database.js
    createFile(config, placeholder + `src/${projectName}/database.js`, tmpltDatabase.generate())
}

// Create files for src/${projectName}/helper
async function dirSrcProjectHelper(config, placeholder, projectName) {
    // Require: Templates
    const tmpltEcho = require('../templates/src/project/helper/echo')

    // src/${projectName}/helper/echo.js
    await createFile(config, placeholder + `src/${projectName}/helper/echo.js`, tmpltEcho.generate())
}
