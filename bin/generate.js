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
                    apinator.isGenerating = true
                    spinner.start('Generating Foundation')
                    break
                case 'missing':
                    apinator.overwrite = false
                    apinator.isGenerating = false
                    spinner.start('Checking Foundation')
                    break
            }
        } else process.exit()
    }

    // Variables
    let placeholder = null
    if (apinator.overwrite) placeholder = await getPlaceholder(true)
    else placeholder = await getPlaceholder(false)
    const numOps = 7 // Number of operations inside this function (because of spinner)

    // Update Apps and Modules
    updateConfAppsModules(placeholder)

    // Create files
    await dirRoot(apinator, placeholder, spinner, numOps, meow.flags) // Create files for /
    await dirSrc(apinator, placeholder, spinner, numOps, meow.flags) // Create files for src/
}

// Create App
exports.app = async function (apinator, spinner, meow) {
    // Variables
    let appName = meow.input[1]
    const placeholder = await getPlaceholder()
    const data = updateConfAppsModules(placeholder)

    // Check for user input
    if (!appName) {
        spinner.stop()
        // Ask user for info        
        const answer = await inquirer.input('App name:') // TODO: Validate for characters (cannot have a .)!
        appName = answer.input
    }

    // Check if Foundation has been created already
    if (meow.input[0] == 'app' && !config.get(process.env.PWD)['hasBeenGenerated']) {
        spinner.fail(`Cannot generate App ${chalk.bold.blue(`${appName}`)}. Foundation missing!`)
        echo.tip(`Run "apinator create ${chalk.bold.blue(`${appName}`)}" instead.`, true)
    }

    // Check if appName already exists, overwrite == false and input[0] == 'app'
    if (data[appName] && !apinator.overwrite && meow.input[0] == 'app') {
        spinner.fail(chalk.bold(`Cannot generate App ${chalk.bold.blue(`${appName}`)}. Already exists!`))
        process.exit()
    }

    // Spinner
    if (meow.input[0] == 'app' || !config.get(process.env.PWD)['hasBeenGenerated']) spinner.start(`Generating App ${chalk.bold.blue(`${appName}`)}`)
    else spinner.start(`Checking App ${chalk.bold.blue(`${appName}`)}`)

    // Create files
    const numOps = 5 // Number of operations inside this function (because of spinner)
    await dirSrcApp(apinator, placeholder, spinner, numOps, appName, meow.flags) // Create files for src/${appName}/helper
    await dirSrcAppHelper(apinator, placeholder, spinner, numOps, appName, meow.flags) // Create files for src/${appName}/helper
}

// Create Module
exports.module = async function (apinator, spinner, meow) {
    // Variables
    let module = {}
    let appName = null
    const placeholder = await getPlaceholder()
    const data = updateConfAppsModules(placeholder)

    // Check for user input
    if (meow.input[1]) module.input = meow.input[1]
    else {
        spinner.stop()
        // Ask user for module
        const answer = await inquirer.input('Module name:') // TODO: Validate for no spaces/special chars, not empty
        module.input = answer.input
    }

    // Create capital versions
    module.uppercase = module.input.charAt(0).toUpperCase() + module.input.slice(1)
    module.lowercase = module.input.charAt(0).toLowerCase() + module.input.slice(1)

    // Ask user for plural
    const answer = await inquirer.input(`Plural form of ${module.uppercase}:`) // TODO: Validate for no spaces/special chars, not empty

    // Create capital versions
    module.pluralLowercase = answer.input.charAt(0).toLowerCase() + answer.input.slice(1)
    module.pluralUppercase = module.pluralLowercase.charAt(0).toUpperCase() + module.pluralLowercase.slice(1)

    // Check if Foundation has been created already
    if (!config.get(process.env.PWD)['hasBeenGenerated']) {
        spinner.fail(`Cannot generate Module ${chalk.bold.blue(`${module.uppercase}`)}. Foundation missing!`)
        echo.tip(`Run "apinator create ${chalk.bold.blue(`${module.uppercase}`)}" to create one.`, true)
    }
    // Check data for Apps
    else if (!data || data.length == 0) {
        spinner.fail(`Cannot generate Module ${chalk.bold.blue(`${module.uppercase}`)}. Apps missing!`)
        echo.tip(`Run "apinator app" to create one.`, true)
    }

    // Check for chosen App
    if (meow.input[2]) appName = meow.input[2]
    else if (Object.keys(data).length == 1) appName = Object.keys(data)[0]
    else {
        spinner.stop()
        const answer = await inquirer.list(`To what App do you want to add ${chalk.bold.blue(`${module.uppercase}`)}?`, Object.keys(data))
        appName = answer.list
    }

    // Check if module already exists and overwrite == false
    if (data[appName].includes(module.uppercase) && !apinator.overwrite) {
        spinner.fail(chalk.bold(`Cannot generate Module ${chalk.bold.blue(`${module.uppercase}`)}. Already exists!`))
        process.exit()
    }
    spinner.start(`Generating Module ${chalk.bold.blue(`${module.uppercase}`)}`)

    // Create files
    const numOps = 3 // Number of operations inside this function (because of spinner)
    await dirSrcAppComponentsModule(apinator, placeholder, spinner, numOps, appName, module, meow.flags) // Create files for src/${appName}/components/${module}
}

/* --- Functions --- */
// Update Apps and Modules in conf
function updateConfAppsModules(placeholder) {
    // Variables
    let objectAppsModules = {}

    // Check for Apps
    if (fs.existsSync(`${placeholder}/src`)) {
        // Loop Apps
        for (i of fs.readdirSync(`${placeholder}/src`)) {
            // Check for Directory
            if (!i.includes('.')) {
                // Save App
                objectAppsModules[i] = []

                // Check for Modules
                if (fs.existsSync(`${placeholder}/src/${i}/components`)) {
                    // Loop Modules
                    for (j of fs.readdirSync(`${placeholder}/src/${i}/components`)) {
                        objectAppsModules[i].push(j)
                    }
                }
            }
        }
    }

    // Set objectAppsModules in conf
    config.set(`${process.env.PWD}.data`, objectAppsModules)
    return objectAppsModules
}

// Spinner
function checkSpinner(spinner, opsCount, numOps, spinnerSuccess, echoSuccess, apinator, flags, placeholder) {
    // Increment
    opsCount++

    // If all async functions are done
    if (opsCount == numOps) {
        if (apinator.isGenerating) {
            if (flags.verbose) spinner.info(spinnerSuccess)
            spinner.succeed(chalk.bold(`Generated ${echoSuccess}!`))
        } else {
            if (flags.verbose) spinner.info(spinnerSuccess)
            if (!config.get(process.env.PWD)['hasBeenGenerated']) spinner.succeed(chalk.bold(`Generated ${echoSuccess}!`))
            else spinner.succeed(chalk.bold(`Checked ${echoSuccess}!`))
        }
        opsCount = 0

        // Update Apps and Modules
        updateConfAppsModules(placeholder)
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
    let placeholder = null

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
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, 'package.json', 'Foundation', apinator, flags, placeholder) })

    // Change directory if necessary
    shell.cd(placeholder)

    // npm init
    shell.exec('npm init -y', { silent: true })

    // npm i modules // TODO: Make this dynamic (add jest for example if configured)
    shell.exec(`npm i ${packages} --save`, { async: true, silent: true })
        .on('exit', () => { opsCount = checkSpinner(spinner, opsCount, numOps, 'npm i --save', 'Foundation', apinator, flags, placeholder) })
    shell.exec(`npm i ${packagesDev} --save-dev`, { async: true, silent: true })
        .on('exit', () => { opsCount = checkSpinner(spinner, opsCount, numOps, 'npm i --save-dev', 'Foundation', apinator, flags, placeholder) })

    // Change directory back
    shell.cd('..')

    // .gitignore
    let gitIgnoreFile = null
    https.get('https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore', (res) => {
        res.on('data', (d) => { gitIgnoreFile += d })
            .on('end', async () => {
                createFile(apinator, `${placeholder}/.gitignore`, gitIgnoreFile)
                    .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, '.gitignore', 'Foundation', apinator, flags, placeholder) })
            })
    }).on('error', (e) => { console.error(e) })

    // .env (This first to create possible placeholder location) // TODO: Parameters sent to generate() should be asked to user
    createFile(apinator, `${placeholder}/.env`, tmpltEnv.generate('local', '3000', 'localhost'))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, '.env', 'Foundation', apinator, flags, placeholder) })
}

// Create files for src/
async function dirSrc(apinator, placeholder, spinner, numOps, flags) {
    // Require: Templates
    const tmpltMain = require('../templates/src/main')

    // src/main.js
    createFile(apinator, `${placeholder}/src/main.js`, tmpltMain.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/main.js`, 'Foundation', apinator, flags, placeholder) })

    // src/projects.json
    createFile(apinator, `${placeholder}/src/projects.json`, '[]')
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/projects.json`, 'Foundation', apinator, flags, placeholder) })
}

// Create files for src/${appName}
async function dirSrcApp(apinator, placeholder, spinner, numOps, appName, flags) {
    // Require: Templates
    const tmpltServer = require('../templates/src/app/server')
    const tmpltConfig = require('../templates/src/app/config')
    const tmpltDatabase = require('../templates/src/app/database')

    // Push new App to projects.json
    let projects = require(`../${placeholder}/src/projects.json`)
    projects.push(`./${appName}/server`)
    createFile({ 'overwrite': true }, `${placeholder}/src/projects.json`, JSON.stringify(projects, null, 4))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/projects.json`, `App ${chalk.bold.blue(`${appName}`)}`, apinator, flags, placeholder) })

    // src/${appName}/server.js
    createFile(apinator, `${placeholder}/src/${appName}/server.js`, tmpltServer.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/server.js`, `App ${chalk.bold.blue(`${appName}`)}`, apinator, flags, placeholder) })

    // src/${appName}/config.json
    createFile(apinator, `${placeholder}/src/${appName}/config.json`, tmpltConfig.generate(appName))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/config.json`, `App ${chalk.bold.blue(`${appName}`)}`, apinator, flags, placeholder) })

    // src/${appName}/database.js
    createFile(apinator, `${placeholder}/src/${appName}/database.js`, tmpltDatabase.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/database.js`, `App ${chalk.bold.blue(`${appName}`)}`, apinator, flags, placeholder) })
}

// Create files for src/${appName}/helper
async function dirSrcAppHelper(apinator, placeholder, spinner, numOps, appName, flags) {
    // Require: Templates
    const tmpltEcho = require('../templates/src/app/helper/echo')

    // src/${appName}/helper/echo.js
    createFile(apinator, `${placeholder}/src/${appName}/helper/echo.js`, tmpltEcho.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/helper/echo.js`, `App ${chalk.bold.blue(`${appName}`)}`, apinator, flags, placeholder) })
}

// Create files for src/${appName}/components/${module.singular}
async function dirSrcAppComponentsModule(apinator, placeholder, spinner, numOps, appName, module, flags) {
    // Require: Templates
    const tmpltController = require('../templates/src/app/components/controller')
    const tmpltModel = require('../templates/src/app/components/model')
    const tmpltRoutes = require('../templates/src/app/components/routes')
    console.log(module)

    // src/${appName}/components/${module.uppercase}/controller.js
    createFile(apinator, `${placeholder}/src/${appName}/components/${module.uppercase}/controller.js`, tmpltController.generate(module))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/components/${module.uppercase}/controller.js`, `Module ${chalk.bold.blue(`${module.uppercase}`)}`, apinator, flags, placeholder) })

    // src/${appName}/components/${module.uppercase}/model.js
    createFile(apinator, `${placeholder}/src/${appName}/components/${module.uppercase}/model.js`, tmpltModel.generate(module))
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/components/${module.uppercase}/model.js`, `Module ${chalk.bold.blue(`${module.uppercase}`)}`, apinator, flags, placeholder) })

    // src/${appName}/components/${module.uppercase}/routes.js
    createFile(apinator, `${placeholder}/src/${appName}/components/${module.uppercase}/routes.js`, tmpltRoutes.generate())
        .then(() => { opsCount = checkSpinner(spinner, opsCount, numOps, `${placeholder}/src/${appName}/components/${module.uppercase}/routes.js`, `Module ${chalk.bold.blue(`${module.uppercase}`)}`, apinator, flags, placeholder) })

    // Add routes to config.js
    let configFile = JSON.parse(fs.readFileSync(`${placeholder}/src/${appName}/config.json`))
    configFile.routes.push({
        "endpoint": `/${module.pluralLowercase}`,
        "file": `./components/${module.uppercase}/routes`
    })
    console.log(configFile)
    fs.writeFileSync(`${placeholder}/src/${appName}/config.json`, JSON.stringify(configFile, null, 4))
}
