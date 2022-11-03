#!/usr/bin/env sh
## Setup Nostr Terminal systemd service.

SERV_NAME='nostr-term'
BIN_PATH='/usr/local/bin/nostr-term'
HOST_DEFAULT='wss://nostr-relay.wlvs.space'

## Define user account used for the service.
[ -n "$1" ] && USER_NAME=$1 || USER_NAME="nostr-term"

SYSTEMD_CONFIG="# Nostr Terminal Server
# See 'man systemd.service' for details.

[Unit]
Description=Nostr Terminal Server
Documentation=https://github.com/cmdruid/nostr-terminal/blob/master/README.md

After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=$BIN_PATH
ExecStart=$BIN_PATH/nostrTerm.js -o sharelink
Type=simple
Restart=on-failure
User=$USER_NAME

[Install]
WantedBy=multi-user.target
"

# Check if user:group is setup.
if ! id -u "$USER_NAME" > /dev/null 2>&1; then
  echo "User does not exist! Adding $USER_NAME user ..."
  useradd $USER_NAME
else
  echo "User $USER_NAME already exists."
fi

# Check if /usr/bin/node exists.
if ! [ -e "/usr/bin/env" ]; then
  echo "Adding symlink for node ..."
  ln -s "$(which node)" /usr/bin/node
fi

# Check if bin path exists.
if ! [ -d "$BIN_PATH" ]; then
  echo "Path does not exist! Creating '$BIN_PATH' path ..."
  mkdir -p $BIN_PATH
else
  echo "Path '$BIN_PATH' already exists."
fi

# Check if install files exist.
if ! [ -e "$BIN_PATH/package.json" ]; then
  echo "Copying over package.json ..."
  cp "../package.json" "$BIN_PATH/package.json"
fi

if ! [ -e "$BIN_PATH/nostrTerm.js" ]; then
  echo "Copying over nostrTerm.js ..."
  cp "../nostrTerm.js" "$BIN_PATH/nostrTerm.js"
fi

if ! [ -d "$BIN_PATH/node_modules" ]; then
  echo "Copying over node_modules ..."
  cp -r "../node_modules" "$BIN_PATH/node_modules"
fi

# Install systemd service template
if [ -z "$(systemctl list-unit-files | grep nostr-term)" ]; then
  echo "Service does not exist! Adding $SERV_NAME.service ..."
  printf "$SYSTEMD_CONFIG" > /etc/systemd/system/nostr-term.service
  systemctl daemon-reload
else
  echo "Service $SERV_NAME already exists."
fi

# Enforce the correct permissions.
chown -R $USER_NAME:$USER_NAME $BIN_PATH
chmod -R 744 $BIN_PATH
chmod a+x $BIN_PATH/nostrTerm.js
