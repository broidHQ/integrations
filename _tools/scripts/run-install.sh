#!/bin/bash

set -e

source "$(dirname "$0")/get-modified.sh"

echo "WERCKER_GIT_BRANCH: $WERCKER_GIT_BRANCH"

INTS_UPDATED=$(integrations_changed)
echo "INTS_UPDATED: $INTS_UPDATED"

for integration in $INTS_UPDATED; do
  echo "> Install dependencies for $integration"
  (cd "$integration" && yarn install --ignore-scripts)
done

echo "> Install dependencies finished"
exit 0
