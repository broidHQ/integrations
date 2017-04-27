#!/bin/bash

set -e

rootDir() {
  xargs -n1 | cut -d/ -f1
}

integrations() {
  echo broid-*/package.json | rootDir | sort | sed '/^_/d'
}

revelant_directories() {
  git diff --name-only origin/master -- "*.ts" "*.json" "*.js" | rootDir | sort | uniq |
  grep -E -i -w '(broid-)\w+' # Get only broid integrations paths
}

integrations_changed() {
  integrations > .integrations
  revelant_directories > .revelant_directories
  comm -12 .integrations .revelant_directories
}

INTS_UPDATED=$(integrations_changed)
if [ ${#INTS_UPDATED[@]} -eq 0 ]; then
  echo $(integrations)
else
  if [ -z "$INTS_UPDATED" ]; then
    exit 1
  fi
  echo $INTS_UPDATED
fi
