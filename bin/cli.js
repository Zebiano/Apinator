#!/usr/bin/env node
'use strict'

// Requires: Packages
const meow = require('meow')
const clear = require('clear')
const chalk = require('chalk')
const updateNotifier = require('update-notifier')

// Requires: Libs
const inquirer = require('../lib/inquirer')
const echo = require('../lib/echo')

// Require: Files
const pkg = require('../package.json')

// Variables
const labelFile = './labels.json'
const helpText = `
NAME
    apinator - NodeJs API manager.

SYNOPSIS
    apinator [OPTIONS]

DESCRIPTION
    Easily create and maintain modular APIs for Node.js, based on express.

OPTIONS
    -c, --create
        Launch interactive CLI to create a new API.

EXAMPLES
    Create a new API:
        apinator create 
`;

// Meow CLI
const cli = meow(helpText, {
    description: false,
    flags: {
        'create': {
            alias: 'c',
            type: 'boolean'
        },
        'module': {
            alias: 'm',
            type: 'boolean'
        }
    }
})

/* --- Start --- */
console.log()

// Update Notifier
updateNotifier({ pkg }).notify({ isGlobal: true })

/* --- Functions --- */