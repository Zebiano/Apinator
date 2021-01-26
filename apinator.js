#!/usr/bin/env node
'use strict'

// Requires: Packages
const meow = require('meow')
const updateNotifier = require('update-notifier')
require('dotenv').config()

// Require: Files
const pkg = require('./package.json')
const cli = require('./bin/cli')

// Variables
const helpText = `
NAME
    apinator - NodeJs API manager.

SYNOPSIS
    apinator [OPTIONS]

DESCRIPTION
    Easily create and maintain modular APIs for Node.js, based on express.

apinator [new|create|foundation] ?<App>
apinator app <name>
apinator module <name> ?<App>

OPTIONS
    -h, --help  Display this help page.
    -v, --verbose   Display more info.

EXAMPLES
    Create a new API:
        apinator create <name>
`;

// Update Notifier
updateNotifier({ pkg }).notify({ isGlobal: true })

// Meow CLI
const meowCli = meow(helpText, {
    description: false,
    flags: {
        'help': {
            alias: 'h',
            type: 'boolean'
        },
        'verbose': {
            alias: 'v',
            type: 'boolean'
        }
    }
})

// Run cli
cli.main(meowCli)
