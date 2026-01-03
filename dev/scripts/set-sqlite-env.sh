#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

cp ${REPO_ROOT}/.env.example ${REPO_ROOT}/.env
rm -f "${REPO_ROOT}/db/rpgtools.sqlite"
mkdir -p ${REPO_ROOT}/db

SQLITE_DIRECTORY_PATH="$(realpath "${REPO_ROOT}/db")"
ESCAPED_PATH="${SQLITE_DIRECTORY_PATH//&/\\&}"
SED_COMMAND="s|^#SQLITE_DIRECTORY_PATH=.*|SQLITE_DIRECTORY_PATH=${ESCAPED_PATH}|"
docker compose -f "${REPO_ROOT}/docker-compose.yml" run --rm dev sed -i "${SED_COMMAND}" .env