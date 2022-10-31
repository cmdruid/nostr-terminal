# Nostr Terminal
Connect to your computer terminal remotely from the browser. Powered by Nostr.

## How to Setup

On your computer:

```bash
## Clone the repository and navigate inside.
git clone <this repo>
cd nostr-terminal

## Start the nostr client.
node app.js
```

The app will give you a base64 encoded connection string to copy/paste into the browser client. This string includes the relay url and connection secret, so keep it safe!

On your browser:
```ini
## Navigate to the browser client (hosted on github):
https://cmdruid.github.io/nostr-terminal/web

## Or host / launch your own client! The files are here:
nostr-terminal/web
```

The browser will ask you for a connection string. Paste in the string and hit connect!

## How to Use

The browser will give you a remote terminal under the same user account running the desktop app. Be careful running this app as a sudo or administartor user!

There are two modes for the terminal: `cmd mode` or `nav mode`. You can toggle modes by clicking the `[ mode ]` button located near the top-right of the terminal window.

 **cmd mode**:
 All keyboard input is buffered locally, then sent to your machine when you press enter. This is the fastest mode, plus it prevents flooding the relay with every keystroke.

 **nav mode**:
 All keyboard input is streamed in real-time. This is nessecary when using a text editor (like vim or nano), but it will flood the relay with traffic. This app uses ephemeral events, so we are flooding in the most friendly way possible. However not all relays may handle this traffic properly, so please use this mode wisely and consider running your own relay if you plan to use it frequently.

## Disclaimer

This is a demo project that opens a remote terminal connection into your machine. The connection is end-to-end encrypted with a strong random secret, and uses a modern crypto library (webcrypto) with best-practices. That being said, please review the code and packages being used (NostrEmitter is only 500 lines), and take your own precautions.

## Known Issues

If you open a text editor (or any TUI application) while using `cmd mode`, the screen may not draw properly. Switch to `nav mode` before hitting enter.

If you lose / close the connection while inside an editor (or any TUI application), the screen will not re-draw the application properly when you reconnect. I'm currently looking for elegant ways to fix this, and suggestions are welcome!

## Bugs / Questions

Please feel free to post any bugs or questions on the issues page!

## Contributions

Anyone may contribute! Please feel free to open a pull request.
