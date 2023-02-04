#!/usr/bin/env node
import os            from 'os'
import pty           from 'node-pty'
import dotenv        from 'dotenv'
import path          from 'path'
import { writeFile } from 'fs'
import { parseArgs } from 'util'
import QREncoder     from 'qrcode'
import NostrEmitter  from '@cmdcode/nostr-emitter'

// Setup our utility libraries.
const ec = new TextEncoder()

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
const { parsed: config } = dotenv.config(configSchema)

if (opt.verbose) console.log('Startup config:', opt ?? {}, arg, config)

// Define our connection parameters.
let relayUrl = arg[0] || config.ADDRESS || 'relay.nostrich.de',
    secret   = arg[1] || config.SECRET  || Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')

// Initialize our emitter object.
const emitter = new NostrEmitter({ silent: opt.silent, verbose: opt.verbose })

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
        emitter.publish('buff', data)
      } else {
        emitter.publish('data', data)
      }
    }
    sendBuffer = false
  })

  console.log('Listening for connections ...')
}

// Output our connection details.
const sharelink = [ secret, relayUrl ].join('@')
const qrcode    = await QREncoder.toString(sharelink, { type:'terminal', small: true })

if (typeof opt.output === 'string') {
  const data = ec.encode(sharelink)
  writeFile(opt.output, data, { mode: 0o644 })
} else { 
  console.log(qrcode, `\nShare Link: ${sharelink}`)
}

// Start main.
main()
