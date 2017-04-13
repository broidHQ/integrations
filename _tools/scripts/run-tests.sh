#!/bin/bash

set -e

source "$(dirname "$0")/get-modified.sh"

echo "CI_BRANCH: $CI_BRANCH"

INTS_UPDATED=$(integrations_changed)
echo $INTS_UPDATED

for integration in $INTS_UPDATED; do
  echo "> Run Tests for $integration"
  (cd "$integration" && yarn run travis)
done

echo "> Tests finished"
exit 0
