#!/usr/bin/env node
'use strict'

// Requires: Packages
const clear = require('clear')

// Requires: Libs
const inquirer = require('../lib/inquirer')
const echo = require('../lib/echo')

// Require: Files
const pkg = require('../package.json')

/* --- Start --- */
console.log()

// If nothing happens, I'm assuming the user ran without flags
echo.error('Missing arguments.')
echo.tip('Use -h for help.')
echo.info('Running version ' + pkg.version + '.', true)

/* --- Functions --- */
