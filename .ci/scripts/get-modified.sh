
#!/bin/bash

GIT_DIFF="origin/master $TRAVIS_BRANCH"

if ([ "$TRAVIS_BRANCH" == "master" ]); then
  echo "Setting git diff to commit range ${TRAVIS_COMMIT_RANGE} comparision for push to master"
  GIT_DIFF="$TRAVIS_COMMIT_RANGE"
else
  echo "Setting git diff to comparision with master branch for branch ${TRAVIS_BRANCH}"
  git remote set-branches --add origin master
  git fetch
fi

# shellcheck disable=SC2086
modified_services=(
  $(
    git diff $GIT_DIFF --name-only |     # Get commits diff to check changed services
    grep -E -i -w '(broid-\/)\w+' |      # Get only broid integrations paths
    awk -F'/' '!($2 in seen){seen[$2]++; print $2}' # Extract service names
  )
)

echo "${modified_services[@]}"
