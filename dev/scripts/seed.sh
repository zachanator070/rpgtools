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
elif [ ! -z "$SQLITE_DIRECTORY_PATH" ]
then
  SQLITE_DB=../../${SQLITE_DIRECTORY_PATH}/rpgtools.sqlite
  pkill -f @rpgtools
  sqlite3 ${SQLITE_DB} .tables | awk '{printf "%s\n%s\n%s\n",$1,$2,$3}' | xargs -I{} sqlite3 ${SQLITE_DB} 'DELETE FROM {}'
  sqlite3 -line ${SQLITE_DB} ".read ../../dev/sqlite-dump/${DUMP_NAME}.sql"
  export SQLITE_DIRECTORY_PATH=../../db && nohup ./../../packages/server/out/@rpgtools-server-linux-x64/@rpgtools-server >electron.log 2>&1 &
  ../../wait_for_server.sh
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
