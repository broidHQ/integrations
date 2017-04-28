#!/bin/sh -e

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

changed() {
  integrations > .integrations
  revelant_directories > .revelant_directories
  comm -12 .integrations .revelant_directories
}

integrations_changed() {
  INTS_UPDATED=$(changed)
  if [ ${#INTS_UPDATED[@]} -eq 0 ]; then
    echo $(integrations)
  else
    if [ -z "$INTS_UPDATED" ]; then
      echo $(integrations)
    fi
    echo $INTS_UPDATED
  fi
}
