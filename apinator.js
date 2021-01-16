#!/usr/bin/env node
'use strict'

// Requires: Packages
const meow = require('meow')
const updateNotifier = require('update-notifier')

// Require: Files
const pkg = require('./package.json')

// Variables
const helpText = `
NAME
    apinator - NodeJs API manager.

SYNOPSIS
    apinator [OPTIONS]

DESCRIPTION
    Easily create and maintain modular APIs for Node.js, based on express.

OPTIONS
    -n, --new
        Launch interactive CLI to create a new API.

EXAMPLES
    Create a new API:
        apinator create 
`;

// Update Notifier
updateNotifier({ pkg }).notify({ isGlobal: true })

// Meow CLI
const cli = meow(helpText, {
    description: false,
    flags: {
        'help': {
            alias: 'h',
            type: 'boolean'
        },
        'new': {
            alias: 'n',
            type: 'boolean'
        },
        'module': {
            alias: 'm',
            type: 'boolean'
        }
    }
})

// Run main file
require('./bin/cli')
