#!/usr/bin/env node

const os     = require('os')
const pty    = require('node-pty')
const path   = require('path')
const dotenv = require('dotenv')
const { writeFile } = require('node:fs/promises')
const { parseArgs } = require('node:util')
const NostrEmitter  = require('@cmdcode/nostr-emitter')

// Setup our utility libraries.
const ec = new TextEncoder()
const utils = NostrEmitter.utils

// Define our dotenv config.
const configSchema = { override: true }

// Define our argument parser interface.
const optSchema = {
  'silent'  : { type: 'boolean', short: 's' },
  'verbose' : { type: 'boolean', short: 'v' },
  'config'  : { type: 'string',  short: 'c' },
  'output'  : { type: 'string',  short: 'o' }
}

// Parse our arguments.
const { values: opt, positionals: arg } = parseArgs({
  options: optSchema, 
  args: process.argv.slice(2),
  allowPositionals: true
})

// If a config path is specified, add to dotenv config.
if (opt.config) {
  configSchema.path = path.resolve(opt.config)
}

// Apply the dotenv configuration.
const config = dotenv.config(configSchema)

if (opt.verbose) console.log('Startup config:', opt, arg, config)

// Define our connection parameters.
let relayUrl = arg[0] || config.RELAY_URL  || 'wss://nostr-relay.wlvs.space'
    secret   = arg[1] || config.SECRET_KEY || utils.getRandomString()

// Initialize our emitter object.
const emitter = new NostrEmitter({ silent: opt.silent })

// Setup our shell process.
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
})

// Initialize our buffers.
let hasBuffer  = false
let sendBuffer = false

emitter.on('init', () => {
  // On init, send clear command.
  ptyProcess.write('clear\r')
})

emitter.on('buff', (data) => {
  // If data sent via buffer,
  // set hasBuffer flag.
  const keys = ec.encode(data)

  if (keys.at(-1) === 9) {
    // If there's a trailing tab,
    // send a return buffer.
    sendBuffer = true
  } else {
    sendBuffer = false
  }

  hasBuffer = true
  if (opt.verbose) console.log('buff:', ec.encode(data))
  ptyProcess.write(data)
})

emitter.on('data', (data) => {
  if (opt.verbose) console.log('data', ec.encode(data))
  ptyProcess.write(data)
})

// Define our main connection function.
async function main() {
  await emitter.connect(relayUrl, secret)

  ptyProcess.onData((data) => {
    if (hasBuffer) {
      // If buffer flag is set, 
      // skip returning chunk.
      hasBuffer  = false
    } else {
      // Return chunk.
      if (sendBuffer) {
        sendBuffer = false
        emitter.emit('buff', data)
      } else {
        emitter.emit('data', data)
      }
    }
    sendBuffer = false
  })
}

// Output our connection details.
const sharelink = utils.encodeShareLink(secret, relayUrl)

if (typeof opt.output === 'string') {
  const data = ec.encode(sharelink)
  writeFile(opt.output, data, { mode: 0644 })
}

console.log(opt.silent
  ? sharelink
  : `Connection string:\n\n${sharelink}\n`
)

// Start main.
main()
