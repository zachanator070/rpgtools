#!/bin/bash

# This script is used during e2e tests to setup a predicable SQLite environment.
# It removes old configurations, SQLite database and sets up a new .env file for SQLite.

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

cp ${REPO_ROOT}/.env.example ${REPO_ROOT}/.env
rm -f "${REPO_ROOT}/db/rpgtools.sqlite"
mkdir -p ${REPO_ROOT}/db

SQLITE_DIRECTORY_PATH="$(realpath "${REPO_ROOT}/db")"
ESCAPED_PATH="${SQLITE_DIRECTORY_PATH//&/\\&}"
SED_COMMAND="s|^#SQLITE_DIRECTORY_PATH=.*|SQLITE_DIRECTORY_PATH=${ESCAPED_PATH}|"
docker compose -f "${REPO_ROOT}/docker-compose.yml" run --rm dev sed -i "${SED_COMMAND}" .env