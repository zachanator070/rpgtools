# rpgtools

Tool set for playing an RPG game

##Requirements:
- docker

##Usage:
`docker run -p 3000:3000 --env-file=.env zachanator070/rpgtools`

##Environment file options:
The environment options that are support are explained in the provided example environment file.
  
See [.env.example](https://github.com/zachanator070/rpgtools/blob/master/.env.example)
  
##Simple Install
A simple make target has been provided to install on a linux debian-based host.
This simple install will:
- install a systemd unit file
- install mongodb
- install a basic config under /etc/rpgtools

To run this simple install use the command:

`make install`

###WARNING
This simple install is not secure. To tighten security for an install please take the following actions
to address security vulnerabilities:
- replace private keys in /etc/rpgtools/.env
- use https
    - recommended config would be to use a reverse proxy like nginx or apache with a generated certificate
    using letsencrypt