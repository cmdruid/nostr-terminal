# Nostr Terminal
Connect to any computer terminal remotely from the browser. NAT traversal powered by Nostr.

## How to Setup

On your computer:

```bash
## Clone the repository and navigate inside.
git clone <this repo>
cd nostr-terminal

## Start the terminal server using a package manager.
yarn start || npm start

## You can also start the server directly, and provide arguments.
./nostrTerm.js <wss://relay.url.here> <optionalcustomsecret>

## If you want to specify your own defaults, 
## create an .env file with the following:
RELAY_URL=<wss://relay.url.here>
SECRET_KEY=<optionalcustomsecret>
```

The app will give you a base64 encoded connection string to copy/paste into the browser client. This string includes the relay url and connection secret, so keep it safe!

If you do not provide a secret, the server will generate a random secret for you. This is the safest option!

On your browser:
```ini
## Navigate to the browser client (hosted on github):
https://cmdruid.github.io/nostr-terminal/web

## Or host your own web client! The files are here:
nostr-terminal/web
```

## How to Use

The browser client will connect to your terminal server, using the same user account running the server. Be careful running this app as a sudo or administartor user!

There are two modes for the terminal: `buff mode` or `live mode`. You can toggle modes by clicking the `[ mode ]` button located near the top-right of the terminal window.

 **buff mode**:
 Most keyboard input is buffered locally, then sent to your machine when you press enter. This is the fastest mode, plus it prevents flooding the relay with every keystroke. Certain features do not work in this mode, such as Up/Down (for scrolling command history) and Tab (for auto-completion). I'm looking to implement them in the future!

 **live mode**:
 All keyboard input is streamed in real-time. This is nessecary when using a text editor (like vim or nano), but it will flood the relay with traffic. This app uses ephemeral events, so we are flooding in the most friendly way possible. However not all relays may handle this traffic properly, so please use this mode wisely and consider running your own relay if you plan to use it frequently.

## Tips on Usage

```bash
## Start the terminal server as a background process, 
## and save the connection string to a local file.
./nodeTerm.mjs > secrets.txt &
cat secrets.txt
```

## Disclaimer

This is a demo project that opens a remote terminal connection into your machine. The connection is end-to-end encrypted with a secret, and uses a modern cryptography library (webcrypto) with best-practices. That being said, please review the code being used (NostrEmitter is just 500 lines), and take your own precautions!

## Known Issues

If you open a text editor (or any TUI application) while using `buff mode`, the screen may not draw properly. Switch to `live mode` before opening the application.

If you switch to `live mode` while you still have characters in the buffer, they will not be sent to the server properly.

If you lose / close the connection while inside an editor (or any TUI application), the screen will not re-draw the application properly when you reconnect. I'm currently looking for elegant ways to fix this, and suggestions are welcome!

## Bugs / Questions

Please feel free to post any bugs or questions on the issues page!

## Contributions

Anyone may contribute! Please feel free to open a pull request.

## Resources

**ANSI escape code**  
https://en.wikipedia.org/wiki/ANSI_escape_code

**Console Codes — Linux manual page**  
https://man7.org/linux/man-pages/man4/console_codes.4.html

**The Standard ASCII Character Set and Codes**  
https://cs.smu.ca/~porter/csc/ref/ascii.html

**ANSI Escape Sequences**  
https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

**xtermjs**  
https://github.com/xtermjs/xterm.js

**node-pty**  
https://github.com/microsoft/node-pty
