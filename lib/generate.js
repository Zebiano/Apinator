// Requires: Packages
const write = require('write')
const fs = require('fs')
const shell = require('shelljs')
const https = require('https')
const conf = require('conf')
const chalk = require('chalk')

// Require: Libs
const inquirer = require('../lib/inquirer')
const echo = require('../lib/echo')

// Variables
const config = new conf()
let opsCount = 0 // Only because of the spinner

// Generate main project structure
exports.foundation = async function (apinator, spinner, meow) {
    spinner.start('Generating Foundation')
    // Check if apinator -n has been used in current directory
    if (!config.get(process.env.PWD)['hasBeenGenerated']) config.set(process.env.PWD + '.hasBeenGenerated', false)
    else {
        spinner.stop()
        // Ask user if overwrite or not
        const confirmNewProject = await inquirer.confirm('It appears apinator has already been used at least once in the current directory. Do you still want to generate a new project?')
        if (confirmNewProject.confirm) {
            const confirmNewProjectList = await inquirer.list('What do you want to do?', [{ name: 'Overwrite files', value: 'overwrite' }, { name: 'Generate missing files', value: 'missing' }])
            switch (confirmNewProjectList.list) {
                case 'overwrite':
                    apinator.overwrite = true
                    spinner.start('Generating Foundation')
                    break
                case 'missing':
                    apinator.overwrite = false
                    spinner.start('Checking Foundation')
                    break
            }
        } else process.exit()
    }

    // Variables
    let placeholder = ''
    const flags = meow.flags
    if (apinator.overwrite) placeholder = await getPlaceholder(true)
    else placeholder = await getPlaceholder(false)
    const numOps = 7 // Number of operations inside this function (because of spinner)

    // Create files
    await dirRoot(apinator, placeholder, spinner, numOps, flags) // Create files for /
    await dirSrc(apinator, placeholder, spinner, numOps, flags) // Create files for src/
}

// Create App
exports.app = async function (apinator, spinner, meow) {
    // Variables
    const projectName = meow.input[1]
    const flags = meow.flags

    // Check for user input
    if (!projectName) {
        spinner.stop()
        // Ask user for info
        const answer = await inquirer.input('Project name:')
        projectName = answer.input
    }

    // Check if Foundation has been created already
    if (meow.input[0] == 'app' && !config.get(process.env.PWD)['hasBeenGenerated']) {
        spinner.fail(`Cannot generate App ${chalk.bold.blue(`${projectName}`)}. Foundation missing!`)
        echo.tip(`Run "apinator create ${chalk.bold.blue(`${projectName}`)}" instead.`, true)
    }

    // Spinner
    if (meow.input[0] == 'app' || !config.get(process.env.PWD)['hasBeenGenerated']) spinner.start('Generating App')
    else spinner.start(`Checking App ${chalk.bold.blue(`${projectName}`)}`)

    // Variables
    const placeholder = await getPlaceholder()
    const numOps = 5 // Number of operations inside this function (because of spinner)

    // Check if projectName already exists, overwrite == false and input[0] == 'app'
    if (fs.existsSync(`${placeholder}/src/${projectName}`) && !apinator.overwrite && meow.input[0] == 'app') {
        spinner.fail(chalk.bold(`Cannot generate App ${chalk.bold.blue(`${projectName}`)}. Already exists!`))
        process.exit()
    }

    // Create files
    await dirSrcProject(apinator, placeholder, spinner, numOps, projectName, flags) // Create files for src/${projectName}/helper
    await dirSrcProjectHelper(apinator, placeholder, spinner, numOps, projectName, flags) // Create files for src/${projectName}/helper
}

// Create Module
exports.module = async function (apinator, spinner, meow) {
    // Check if Foundation has been created already
    if (!config.get(process.env.PWD)['hasBeenGenerated']) {
        spinner.fail(`Cannot generate Module ${chalk.bold.blue(`${projectName}`)}. Foundation missing!`)
        echo.tip(`Run "apinator create ${chalk.bold.blue(`${projectName}`)}" instead.`, true)
    }
}

/* --- Functions --- */
// Spinner
function checkSpinner(spinner, opsCount, numOps, spinnerSuccess, echoSuccess, apinator, flags) {
    // Increment
    opsCount++

    // If all async functions are done
    if (opsCount == numOps) {
        if (apinator.overwrite) {
            if (flags.verbose) spinner.info(spinnerSuccess)
            spinner.succeed(chalk.bold(`Generated ${echoSuccess}!`))
        } else {
            if (flags.verbose) spinner.info(spinnerSuccess)
            if (!config.get(process.env.PWD)['hasBeenGenerated']) spinner.succeed(chalk.bold(`Generated ${echoSuccess}!`))
            else spinner.succeed(chalk.bold(`Checked ${echoSuccess}!`))
        }
        opsCount = 0
    }
    // Else spinner.info()
    else if (flags.verbose) {
        spinner.info(spinnerSuccess)
        spinner.start()
    }

    // Return
    return opsCount
}
// Returns placeholder
async function getPlaceholder(reset) {
    // Variables
    let placeholder = ''

    // Check for current workspace
    if (process.env.PWD.substring(process.env.PWD.lastIndexOf('/') + 1) == 'apinator' && process.env.ENV != 'local') {
        const answer = await inquirer.confirm('You seem to be working inside a directory called "apinator" without setting `ENV=local` inside the `.env` file. Are you sure you want to proceed?')
        if (answer.confirmApinatorRepo == true) echo.warn('Alright then, I hope you know what you\'re doing.')
        else process.exit()
    } else if (process.env.ENV == 'local') {
        placeholder = 'placeholder'
        if (reset && fs.existsSync(placeholder)) shell.rm('-rf', placeholder)
    }

    // Return
    return placeholder
}

// Creates a file if apinator.overwrite == true or if file does not already exist
async function createFile(apinator, path, template) {
    if ((apinator != undefined && apinator.overwrite) || !fs.existsSync(path))
        await write(path, template, { newline: true })
}

// Create files for /
async function dirRoot(apinator, placeholder, spinner, numOps, flags) {
    // Require: Templates
    const tmpltEnv = require('../templates/env')
    const tmpltPackageJson = require('../templates/package-json.js')

    // Variables
    const packages = 'chalk dotenv express mongoose'
    const packagesDev = 'nodemon'

    // package.json
    await createFile(apinator, `${placeholder}/package.json`, tmpltPackageJson.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, 'package.json', 'Foundation', apinator, flags) })

    // Change directory if necessary
    shell.cd(placeholder)

    // npm init
    shell.exec('npm init -y', { silent: true })

    // npm i modules // TODO: Make this dynamic (add jest for example if configured)
    shell.exec(`npm i ${packages} --save`, { async: true, silent: true })
        .on('exit', () => { opsCount = checkSpinner(spinner, opsCount, numOps, 'npm i --save', 'Foundation', apinator, flags) })
    shell.exec(`npm i ${packagesDev} --save-dev`, { async: true, silent: true })
        .on('exit', () => { opsCount = checkSpinner(spinner, opsCount, numOps, 'npm i --save-dev', 'Foundation', apinator, flags) })

    // Change directory back
    shell.cd('..')

    // .gitignore
    let gitIgnoreFile = ''
    https.get('https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore', (res) => {
        res.on('data', (d) => { gitIgnoreFile += d })
            .on('end', async () => {
                createFile(apinator, `${placeholder}/.gitignore`, gitIgnoreFile)
                    .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, '.gitignore', 'Foundation', apinator, flags) })
            })
    }).on('error', (e) => { console.error(e) })

    // .env (This first to create possible placeholder location) // TODO: Parameters sent to generate() should be asked to user
    createFile(apinator, `${placeholder}/.env`, tmpltEnv.generate('local', '3000', 'localhost'))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, '.env', 'Foundation', apinator, flags) })
}

// Create files for src/
async function dirSrc(apinator, placeholder, spinner, numOps, flags) {
    // Require: Templates
    const tmpltMain = require('../templates/src/main')

    // src/main.js
    createFile(apinator, `${placeholder}/src/main.js`, tmpltMain.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/main.js`, 'Foundation', apinator, flags) })

    // src/projects.json
    createFile(apinator, `${placeholder}/src/projects.json`, '[]')
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/projects.json`, 'Foundation', apinator, flags) })
}

// Create files for src/${projectName}
async function dirSrcProject(apinator, placeholder, spinner, numOps, projectName, flags) {
    // Require: Templates
    const tmpltServer = require('../templates/src/project/server')
    const tmpltConfig = require('../templates/src/project/config')
    const tmpltDatabase = require('../templates/src/project/database')

    // Push new project to projects.json
    let projects = require(`../${placeholder}/src/projects.json`)
    projects.push(`./${projectName}/server`)
    createFile({ 'overwrite': true }, `${placeholder}/src/projects.json`, JSON.stringify(projects, null, 4))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/projects.json`, `App ${chalk.bold.blue(`${projectName}`)}`, apinator, flags) })

    // src/${projectName}/server.js
    createFile(apinator, `${placeholder}/src/${projectName}/server.js`, tmpltServer.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${projectName}/server.js`, `App ${chalk.bold.blue(`${projectName}`)}`, apinator, flags) })

    // src/${projectName}/config.json
    createFile(apinator, `${placeholder}/src/${projectName}/config.json`, tmpltConfig.generate(projectName))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${projectName}/config.json`, `App ${chalk.bold.blue(`${projectName}`)}`, apinator, flags) })

    // src/${projectName}/database.js
    createFile(apinator, `${placeholder}/src/${projectName}/database.js`, tmpltDatabase.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${projectName}/database.js`, `App ${chalk.bold.blue(`${projectName}`)}`, apinator, flags) })
}

// Create files for src/${projectName}/helper
async function dirSrcProjectHelper(apinator, placeholder, spinner, numOps, projectName, flags) {
    // Require: Templates
    const tmpltEcho = require('../templates/src/project/helper/echo')

    // src/${projectName}/helper/echo.js
    createFile(apinator, `${placeholder}/src/${projectName}/helper/echo.js`, tmpltEcho.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${projectName}/helper/echo.js`, `App ${chalk.bold.blue(`${projectName}`)}`, apinator, flags) })
}
