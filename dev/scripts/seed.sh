#!/usr/bin/env bash

# This scripts seeds the database with a given dump name. It supports both Postgres and SQLite depending on the .env configuration.

# Function to time and echo each command
run_timed() {
  echo "[timing] Running: $*"
  time -p "$@"
}

restart_active_app_service() {
  local active_service=""

  for service in server server-brk prod; do
    if [ -n "$(docker compose ps -q "$service")" ]; then
      active_service="$service"
      break
    fi
  done

  if [ -z "$active_service" ]; then
    echo "No active app service found (server, server-brk, or prod)."
    exit 1
  fi

  run_timed docker compose restart "$active_service"
}

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
  if [ "$DUMP_NAME" = "new_server" ]
  then
    run_timed docker exec rpgtools-postgres-1 psql -U rpgtools -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    restart_active_app_service
    run_timed ${REPO_ROOT}/dev/scripts/wait_for_server.sh
  else
    run_timed docker exec rpgtools-postgres-1 psql -U rpgtools -v ON_ERROR_STOP=1 -f /postgres-dump/clean.sql
    run_timed docker exec rpgtools-postgres-1 psql -U rpgtools -v ON_ERROR_STOP=1 -f /postgres-dump/${DUMP_NAME}.sql
  fi
elif [ ! -z "$SQLITE_DIRECTORY_PATH" ]
then
  # set SQLITE_DB_NAME if it is not set
  SQLITE_DB_NAME=${SQLITE_DB_NAME:-rpgtools}
  SQLITE_DB=${SQLITE_DIRECTORY_PATH}/${SQLITE_DB_NAME}.sqlite
  OS=$(uname -s)
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Terminating rpgtools"
  run_timed pkill -f @rpgtools-server
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Deleting existing data from ${SQLITE_DB}"
  run_timed bash -c "sqlite3 ${SQLITE_DB} .tables | awk '{printf \"%s\\n%s\\n%s\\n\",\$1,\$2,\$3}' | grep -v 'SequelizeMeta' | xargs -I{} sqlite3 ${SQLITE_DB} 'DELETE FROM {}'"
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Seeding database from dump: ${DUMP_NAME}"
  run_timed sqlite3 -line ${SQLITE_DB} ".read ${REPO_ROOT}/dev/sqlite-dump/${DUMP_NAME}.sql"
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Starting rpgtools"
  run_timed ${REPO_ROOT}/dev/scripts/run-electron-app.sh
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Waiting for server to be available"
  run_timed ${REPO_ROOT}/dev/scripts/wait_for_server.sh
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  echo "[${TIMESTAMP}] Seed complete"
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
