#!/bin/sh
set -e

rootDir() {
  xargs -n1 | cut -d/ -f1
}

integrations() {
  echo broid-*/package.json | rootDir | sort | sed '/^_/d'
}

revelant_directories() {
  git diff --name-only "origin/master...$CI_BRANCH" | rootDir | sort | uniq |
  grep -E -i -w '(broid-)\w+' # Get only broid integrations paths
}

integrations_changed() {
  integrations > .integrations
  revelant_directories > .revelant_directories
  comm -12 .integrations .revelant_directories
}

echo $(integrations_changed)
