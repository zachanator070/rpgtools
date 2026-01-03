#!/usr/bin/env bash

. ../../.env


SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

DUMP_NAME=$1
if [ -z "$DUMP_NAME" ]
then
  echo "No dump name given. Usage: seed.sh DUMP_NAME"
  exit 1
fi

if [ ! -z "$POSTGRES_HOST" ]
then
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/clean.sql
  docker exec rpgtools-postgres-1 psql -U rpgtools -f /postgres-dump/${DUMP_NAME}.sql
elif [ ! -z "$SQLITE_DIRECTORY_PATH" ]
then
  # set SQLITE_DB_NAME if it is not set
  SQLITE_DB_NAME=${SQLITE_DB_NAME:-rpgtools}
  SQLITE_DB=${SQLITE_DIRECTORY_PATH}/${SQLITE_DB_NAME}.sqlite
  OS=$(uname -s)
  pkill -f @rpgtools
  sqlite3 ${SQLITE_DB} .tables | awk '{printf "%s\n%s\n%s\n",$1,$2,$3}' | grep -v 'SequelizeMeta' | xargs -I{} sqlite3 ${SQLITE_DB} 'DELETE FROM {}'
  sqlite3 -line ${SQLITE_DB} ".read ${REPO_ROOT}/dev/sqlite-dump/${DUMP_NAME}.sql"
  ${REPO_ROOT}/dev/scripts/run-electron-app.sh
  ${REPO_ROOT}/wait_for_server.sh
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
