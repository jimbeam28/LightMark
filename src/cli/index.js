#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init.js'
import { newArticle } from './commands/new.js'
import { buildCommand } from './commands/build.js'

const program = new Command()

program
  .name('lightmark')
  .description('A simple static blog generator for managing multiple series of Markdown notes')
  .version('1.0.0')

// lightmark init <dir>
program
  .command('init <dir>')
  .description('Initialize a new LightMark site in the specified directory')
  .action(async (dir) => {
    try {
      await init(dir)
    } catch (err) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }
  })

// lightmark new <series>
program
  .command('new <series>')
  .description('Create a new article in the specified series')
  .option('-t, --title <title>', 'Article title')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('-r, --root <dir>', 'Site root directory')
  .action(async (series, options) => {
    try {
      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : []
      await newArticle(series, {
        title: options.title,
        tags,
        root: options.root
      })
    } catch (err) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }
  })

// lightmark build
program
  .command('build')
  .description('Build the static site')
  .option('-c, --config <file>', 'Config file path', 'site.yaml')
  .option('-o, --output <dir>', 'Output directory')
  .option('-r, --root <dir>', 'Site root directory')
  .action(async (options) => {
    try {
      await buildCommand(options)
    } catch (err) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }
  })

program.parse()