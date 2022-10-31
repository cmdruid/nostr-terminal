import os      from 'os'
import pty     from 'node-pty'
import NostrEmitter from '@cmdcode/nostr-emitter'

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
const emitter = new NostrEmitter()
const utils = NostrEmitter.utils

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
})

let dropCmd = false

emitter.on('init', () => {
  ptyProcess.write('clear\r')
})

emitter.on('cmd', (data) => {
  dropCmd = true
  ptyProcess.write(data)
})

emitter.on('data', (data) => {
  ptyProcess.write(data)
})

const relayUrl = 'wss://nostr-relay.wlvs.space'
const secret = utils.getRandomString()

console.log(`Paste this connection string into your web app:\n\n${utils.encodeShareLink(secret, relayUrl)}\n`)

await emitter.connect(relayUrl, secret)

ptyProcess.onData((data) => {
  if (dropCmd) {
    dropCmd = false
  } else {
    emitter.emit('data', data)
  }
})
