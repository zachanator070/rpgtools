#!/usr/bin/env bash

. ../../.env


DUMP_NAME=$1
RESTART_SERVER=${2:-false}
if [ -z "$DUMP_NAME" ]
then
  echo "No dump name given. Usage: seed.sh DUMP_NAME [RESTART_SERVER]"
fi


if [ ! -z "$POSTGRES_HOST" ]
then
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/clean.sql
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/${DUMP_NAME}.sql
elif [ ! -z "$SQLITE_DIRECTORY_PATH" ]
then
  SQLITE_DB=../../${SQLITE_DIRECTORY_PATH}/rpgtools.sqlite
  pkill -f @rpgtools
  sqlite3 ${SQLITE_DB} .tables | awk '{printf "%s\n%s\n%s\n",$1,$2,$3}' | grep -v 'SequelizeMeta' | xargs -I{} sqlite3 ${SQLITE_DB} 'DELETE FROM {}'
  sqlite3 -line ${SQLITE_DB} ".read ../../dev/sqlite-dump/${DUMP_NAME}.sql"
  if [ "$RESTART_SERVER" = true ]; then
    ELECTRON_EXEC=$(shell ./dev/scripts/forge-path.sh)
    export SQLITE_DIRECTORY_PATH=../../db && nohup ../../${ELECTRON_EXEC} >../../electron.log 2>&1 &
    ../../wait_for_server.sh
  fi
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
