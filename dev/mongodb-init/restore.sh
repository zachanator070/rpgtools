#!/bin/sh
DUMP_NAME=$1
if [ -z "$DUMP_NAME" ]
then
  DUMP_NAME=dump
fi
DUMP_PATH=/docker-entrypoint-initdb.d/$DUMP_NAME
if [ -d "$DUMP_PATH" ]
then
  echo "Deleting old database $MONGO_INITDB_DATABASE"
  mongo /docker-entrypoint-initdb.d/clean.js
  echo "Restoring dump to database: $DUMP_PATH"
  mongorestore $DUMP_PATH
else
  echo "Dump directory does not exist: $DUMP_PATH"
fi