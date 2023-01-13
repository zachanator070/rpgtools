# rpgtools ![Build Status](https://github.com/zachanator070/rpgtools/actions/workflows/cd.yml/badge.svg)

Tool set for playing an RPG game

See the [product page](https://zachanator070.github.io/rpgtools/) for a list of basic features.

See the [rpgtools-srd](https://github.com/zachanator070/rpgtools-srd) repo for Dnd 5e content to use with RPGTools.

## Usage

### Desktop Environment
Not Implemented yet

This environment is designed to require no configuration and without the use of docker on any OS.

### Production Server Environment

#### Requirements

- docker

This environment is to be used by those that wish to run rpgtools in an optimized, performant setting
where users will interact with the service.

To run the service:
1. Download the `.env.example` and save as `.env`
2. Change the line with `#MONGODB_HOST=mongodb` to `MONGODB_HOST=mongodb`
3. Download the `docker-compose.yml` file
4. Run the command `docker-compose up -d prod`

The production environment will run the following docker containers:

- nodejs webserver
- mongodb database

### Development Environment

#### Requirements

- docker
- docker-compose
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
This simple install will:

- install a systemd unit file
- install mongodb
- install a basic config under /etc/rpgtools

To run this simple install use the command:

`make install`

This script will set up mongodb and ensure that the RPGTools docker container is always running.

#### WARNING

This simple install is not secure. If you plan on having rpgtools accept connections from the public internet, it is recommended to tighten security in the following ways:

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

