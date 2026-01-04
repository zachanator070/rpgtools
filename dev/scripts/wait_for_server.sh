#!/usr/bin/env bash

# This script waits for the server to be available at http://localhost:3000

attempt_counter=0
max_attempts=15

until curl --output /dev/null --silent --head --fail http://localhost:3000; do
    if [ ${attempt_counter} -eq ${max_attempts} ];then
      echo "Max attempts reached"
      exit 1
    fi

    printf '.'
    attempt_counter=$(($attempt_counter+1))
    sleep 1
done