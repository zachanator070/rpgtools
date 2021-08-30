#!/bin/sh
if [ -d /docker-entrypoint-initdb.d/dump ]; then
  mongorestore /docker-entrypoint-initdb.d/dump
fi