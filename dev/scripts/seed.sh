#!/usr/bin/env bash

DUMP_NAME=$1
if [ -z "$DUMP_NAME" ]
then
  echo "No dump name given. Usage: seed.sh DUMP_NAME"
fi

if [ ! -z "$MONGODB_HOST" ]
then
  docker exec rpgtools_mongodb_1 /mongodb-dump/restore.sh ${DUMP_NAME}.archive
elif [ ! -z "$POSTGRES_HOST" ]
then
  docker exec rpgtools_postgres_1 psql -U rpgtools -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'rpgtools';" || true
  docker exec rpgtools_postgres_1 psql -U rpgtools < ../../dev/postgres-dump/${DUMP_NAME}.sql
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi
