# rpgtools [![Build Status](https://travis-ci.org/zachanator070/rpgtools.svg?branch=master)](https://travis-ci.org/zachanator070/rpgtools)


Tool set for playing an RPG game

## Usage
### Requirements
- docker
- docker-compose
- make (optional)
- jq (for prod build)
- lerna (npm install -g lerna)

### Production Environment
`docker-compose up prod-server`
or
`make prod`

### Development Environment
`docker-compose up dev-server`
or 
`make dev`

## Environment file options
The environment options that are support are explained in the provided example environment file.
  
See [.env.example](https://github.com/zachanator070/rpgtools/blob/master/.env.example)
  
## Install

### WARNING
This simple install is not secure. If you plan on having rpgtools accept connections from the public internet, it is recommended to tighten security in the following ways:
- replace private keys in environment file
    - /etc/rpgtools/.env for linux hosts and .env file in your home folder of this repo for windows hosts
    - You can generate a new key by using the openssl unix utility with the command `openssl rand -base64 x`
    where x is the number of bytes you want the key to have.
    - If you don't want the NSA or quantum computers to crack your authentication tokens, use a private key
    of at least 384 bytes (3072-bit) see [wikipedia](https://en.wikipedia.org/wiki/Key_size#Asymmetric_algorithm_key_lengths)
- use https
    - recommended config would be to use a reverse proxy like nginx or apache with a generated certificate
    using letsencrypt

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

### Linux
#### Requirements
- docker
- docker-compose
- make

A simple make target has been provided to install on a linux debian-based host.
This simple install will:
- install a systemd unit file
- install mongodb
- install a basic config under /etc/rpgtools

To run this simple install use the command:

`make install`

### Windows
No current install method yet
