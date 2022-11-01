import os      from 'os'
import pty     from 'node-pty'
import NostrEmitter from '@cmdcode/nostr-emitter'

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
  console.log('buff:', ec.encode(data))
  ptyProcess.write(data)
})

emitter.on('data', (data) => {
  console.log('data', ec.encode(data))
  ptyProcess.write(data)
})

const relayUrl = 'wss://nostr-relay.wlvs.space'
const secret = utils.getRandomString()

console.log(`Paste this connection string into your web app:\n\n${utils.encodeShareLink(secret, relayUrl)}\n`)

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
