#!/bin/bash
set +H
set -a
. $1
set +a
env_vars=$(grep -o '^[^#=]*' "$1")
for key in $env_vars
do
    if [[ $key =~ ^#.* ]]; then
        echo "Skipping the commented value" - $key
    else
        echo "Uploading" - $key
        # vc env rm ${key} $2  -y
        value=$(awk -F "=" '/'${key}'/{print $2}' $1)
        echo "$key=$value"
        echo "$value" | vc env add $key $2
    fi
done
