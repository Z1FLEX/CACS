#!/bin/bash

echo "Installing local CA certificate..."

CERT_PATH="$(pwd)/infra/tls/rootCA.pem"

if [ ! -f "$CERT_PATH" ]; then
  echo "ERROR: rootCA.pem not found at $CERT_PATH"
  echo "Make sure you have pulled the latest changes from git."
  exit 1
fi

OS="$(uname -s)"

case "$OS" in
  Linux*)
    # For Chrome/Chromium on Linux (uses NSS)
    mkdir -p $HOME/.pki/nssdb
    certutil -d $HOME/.pki/nssdb -A -t "CT,," -n "CACS Local CA" -i "$CERT_PATH"
    # For system-wide (Firefox uses this on some distros)
    sudo cp "$CERT_PATH" /usr/local/share/ca-certificates/cacs-local-ca.crt
    sudo update-ca-certificates
    echo "Done! Restart your browser."
    ;;
  Darwin*)
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_PATH"
    echo "Done! Restart your browser."
    ;;
  MINGW*|CYGWIN*|MSYS*)
    certutil -addstore -user Root "$CERT_PATH"
    echo "Done! Restart your browser."
    ;;
  *)
    echo "Unknown OS. Please manually install: $CERT_PATH"
    ;;
esac