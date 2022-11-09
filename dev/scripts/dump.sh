#!/usr/bin/env bash
	
if [ ! -z "$MONGODB_HOST" ]
then
  sudo rm -rf ./dev/mongodb-dump/dump.archive
  docker-compose exec mongodb mongodump --archive=/mongodb-dump/dump.archive -d rpgtools
  sudo chown ${USER}:${USER} ./dev/mongodb-dump/dump.archive
elif [ ! -z "$POSTGRES_HOST" ]
then
  sudo rm -rf ./dev/postgres-dump/dump.sql
  docker exec rpgtools_postgres_1 pg_dump -c -C -U rpgtools rpgtools > ./dev/postgres-dump/dump.sql
else
  echo "Unable to detect database, check .env file for at least one database host defined"
  exit 1
fi