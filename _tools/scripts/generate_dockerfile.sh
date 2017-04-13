#!/bin/bash

set -e

SUFFIX=${1:-test}
today=`date '+%Y_%m_%d__%H_%M_%S'`;
filename="./Dockerfile.$SUFFIX.$today"

echo $SUFFIX
echo $filename

echo "FROM node:6.9.4-alpine"
echo ""
echo "RUN apk --no-cache add ca-certificates curl make gcc g++ python linux-headers paxctl libgcc libstdc++ gnupg git wget && update-ca-certificates"
echo "RUN mkdir -p /opt/yarn && cd /opt/yarn && wget https://yarnpkg.com/latest.tar.gz && tar zxf latest.tar.gz"
echo "ENV PATH \"$PATH:/opt/yarn/dist/bin\""
echo ""
echo "ARG CI_BRANCH"
echo "ENV CI_BRANCH \$CI_BRANCH"
echo ""
echo "RUN mkdir -p /integrations"
echo "WORKDIR /integrations/"
echo ""
echo "COPY ./_tools /integrations/_tools/"
echo "RUN chmod +x _tools/scripts/run-install.sh"
echo "RUN chmod +x _tools/scripts/run-tests.sh"
echo ""
for dir in ../../broid-* ; do
  dircleaned=${dir//[..\/]/}
  echo "COPY ./$dircleaned/package.json ./$dircleaned/yarn.lock /integrations/$dircleaned/"
done
echo ""
echo "COPY ./.git /integrations/.git/"
echo ""
echo "RUN /bin/sh _tools/scripts/run-install.sh"
echo ""
for dir in ../../broid-* ; do
  dircleaned=${dir//[..\/]/}
  echo "COPY ./$dircleaned/src/* /integrations/$dircleaned/src/"
done
echo ""
echo "RUN /bin/sh _tools/scripts/run-tests.sh"
echo ""
