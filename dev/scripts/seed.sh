#!/usr/bin/env bash

. ../../.env

DUMP_NAME=$1
if [ -z "$DUMP_NAME" ]
then
  echo "No dump name given. Usage: seed.sh DUMP_NAME"
fi

if [ ! -z "$MONGODB_HOST" ]
then
  docker exec rpgtools-mongodb-1 mongosh /mongodb-dump/clean.js
  docker exec rpgtools-mongodb-1 mongorestore --archive=/mongodb-dump/${DUMP_NAME}.archive --noIndexRestore
elif [ ! -z "$POSTGRES_HOST" ]
then
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/clean.sql
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/${DUMP_NAME}.sql
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
