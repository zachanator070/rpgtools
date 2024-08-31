#!/usr/bin/env bash

. .env

if [ ! -z "$POSTGRES_HOST" ]
then
  sudo rm -rf ./dev/postgres-dump/dump.sql
  docker compose exec postgres pg_dump -U rpgtools rpgtools -a --disable-triggers --inserts > ./dev/postgres-dump/dump.sql
elif [ ! -z "$SQLITE_DIRECTORY_PATH" ]
then
    sqlite3 ./db/rpgtools.sqlite -cmd '.output ./dev/sqlite-dump/dump.sql' '.dump'
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi