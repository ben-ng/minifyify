#!/usr/bin/env node

var min = require('../lib');

process.stdin.pipe(min()).pipe(process.stdout);
