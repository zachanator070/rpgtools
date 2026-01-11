#!/bin/bash

. ../../.env

if [[ ${SQLITE_DIRECTORY_PATH} != "" ]]; then
  pkill -f @rpgtools-server
  exit 0
elif [[ ${POSTGRES_HOST} != "" ]]; then
  echo "Postgres database detected, no app to stop."
  exit 0
else 
  echo "No database configuration detected, unable to stop app."
  exit 1
fi