#!/usr/bin/env node

const VERBOSE = false

const os = require('os')
const pty = require('node-pty')
const NostrEmitter =require('@cmdcode/nostr-emitter')

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
const emitter = new NostrEmitter()
const utils = NostrEmitter.utils
const ec = new TextEncoder()

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
})

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
  if (VERBOSE) console.log('buff:', ec.encode(data))
  ptyProcess.write(data)
})

emitter.on('data', (data) => {
  if (VERBOSE) console.log('data', ec.encode(data))
  ptyProcess.write(data)
})

const relayUrl = process.argv[2] || process.env.RELAY_URL || 'wss://nostr-relay.wlvs.space'
const secret   = process.argv[3] || process.env.SECRET_KEY || utils.getRandomString()

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

console.log(`Paste this connection string into your web app:\n\n${utils.encodeShareLink(secret, relayUrl)}\n`)

main()
