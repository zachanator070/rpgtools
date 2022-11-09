#!/bin/sh
DUMP_NAME=$1
if [ -z "$DUMP_NAME" ]
then
  DUMP_NAME=dump.archive
fi
DUMP_PATH=/mongodb-scripts/$DUMP_NAME
if [ -e "$DUMP_PATH" ]
then
  echo "Deleting old database $MONGO_INITDB_DATABASE"
  mongosh /mongodb-scripts/clean.js
  echo "Restoring dump to database: $DUMP_PATH"
  mongorestore --archive=$DUMP_PATH --noIndexRestore
else
  echo "Dump archive does not exist: $DUMP_PATH"
  exit 1
fi