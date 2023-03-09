#!/usr/bin/env bash
# exit immediately when a command fails
set -e
# only exit with zero if all commands of the pipeline exit successfully
set -o pipefail
# error on unset variables
set -u

d=`date '+%Y-%m-%d %H:%M:%S'`

export VUE_APP_DATE=$d
if [ $# == 1 ]; then
  export VUE_APP_RELEASE=$1
else
  export VUE_APP_RELEASE=main
fi

if [ $VUE_APP_RELEASE == main ]; then
  export VUE_APP_OTEL_COLLECTOR=http://172.16.31.68:31454/v1/traces
fi

echo $VUE_APP_DATE
echo $VUE_APP_RELEASE
echo $VUE_APP_OTEL_COLLECTOR

export NODE_OPTIONS=--max-old-space-size=32768

pnpm install
pnpm build:inner
docker build -t harbor.cloudminds.com/kubegems/dashboard:$VUE_APP_RELEASE .
docker push harbor.cloudminds.com/kubegems/dashboard:$VUE_APP_RELEASE