# rpgtools ![Build Status](https://github.com/zachanator070/rpgtools/actions/workflows/release.yml/badge.svg)

Tool set for playing an RPG game

See the [product page](https://zachanator070.github.io/rpgtools/) for a list of basic features.

See the [rpgtools-srd](https://github.com/zachanator070/rpgtools-srd) repo for Dnd 5e content to use with RPGTools.

## Usage

### Desktop Environment

This environment is designed to run on any OS, requires no configuration, and doesn't require any prerequisites to be installed.

See the [releases page](https://github.com/zachanator070/rpgtools/releases) for a list of installers for Windows, MacOS, and Linux.

Yes I understand none of these installers are digitally signed. It's a bit of effort to do this, and it's currently not a priority.

#### Notes for Windows Users
- The Windows installer is not currently signed. Windows will try to block the installer, but you can click the 'Run Anyway' button to ignore the warning, and everything should work fine. 
- After running the setup application for Windows, the server is installed at `C:\Users\<your username>\AppData\Local\rpgtools-server`

#### Notes for Linux Users
- After installing the .deb or .rpm, the server is installed at `/usr/lib/rpgtools-server`

#### Notes for Mac Users
- The application the dmg installs is not signed. It costs $100/year for a Mac Developer license to do this, and I'm too cheap to invest.
You can still run the application by following this guide 
[here](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

### Production Server Environment

#### Requirements

- docker
- docker compose plugin

This environment is to be used by those that wish to run rpgtools in an optimized, performant setting
where users will interact with the service.

To run the service:
1. Download the `.env.example` and save as `.env`
2. Change the line with `#MONGODB_HOST=mongodb` to `MONGODB_HOST=mongodb`
3. Download the `docker-compose.yml` file
4. Run the command `docker compose up -d prod`

The production environment will run the following docker containers:

- nodejs webserver
- mongodb database

### Development Environment

#### Requirements

- docker
- docker compose plugin
- make
- jq

This environment is for anyone that wishes to contribute to the codebase and actively change
the source of rpgtools while having access to debug tools.

To run the development environment run the command:
`make dev`


In this configuration, the bundler will stay running and attempt to rebuild the website bundle
when a code change occurs.

## Environment file options

The environment options that are supported are explained in the provided example environment file.

See [.env.example](https://github.com/zachanator070/rpgtools/blob/master/.env.example)

## Advanced Server Administration

A simple make target has been provided to install on a linux debian-based host.
This simple installation will:

- install a systemd unit file
- install mongodb
- install a basic config under /etc/rpgtools

To run this simple installation use the command:

`make install`

This script will set up mongodb and ensure that the RPGTools docker container is always running.

#### WARNING

This simple installation is not secure. If you plan on having rpgtools accept connections from the public internet, it is recommended to tighten security in the following ways:

- replace private keys in environment file
  - /etc/rpgtools/.env for linux hosts and .env file in your home folder of this repo for windows hosts
  - You can generate a new key by using the openssl unix utility with the command `openssl rand -base64 x`
    where x is the number of bytes you want the key to have.
  - If you don't want the NSA or quantum computers to crack your authentication tokens, use a private key
    of at least 384 bytes (3072-bit) see [wikipedia](https://en.wikipedia.org/wiki/Key_size#Asymmetric_algorithm_key_lengths)
- use https
  - it is recommended to use a reverse proxy like nginx or apache with a generated certificate
    using [letsencrypt](https://letsencrypt.org/)

If your install will be behind a proxy server, be sure to configure the proxy server to address the following issues:

- Limits on request size. Uploads can be rather large, and a proxy server can block requests if they are larger than
  a default value.
- Websockets. Proxy servers can block websockets if they are not configured to allow them. see [nginx](http://nginx.org/en/docs/http/websocket.html)

If using nginx as a proxy server, the following configuration will address these problems:

```
map $http_upgrade $connection_upgrade {
         default upgrade;
         '' close;
 }

 server {
         server_name rpgtools.thezachcave.com;

         proxy_connect_timeout       60s;
         proxy_send_timeout          300s;
         proxy_read_timeout          300s;

         client_max_body_size 100M;

         location / {
                 proxy_pass http://127.0.0.1:3000/;
                 proxy_http_version 1.1;
                 proxy_set_header Upgrade $http_upgrade;
                 proxy_set_header Connection $connection_upgrade;
                 proxy_set_header Host $host;
         }
 }
```

