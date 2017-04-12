#!/bin/bash

set -e

source "$(dirname "$0")/get-modified.sh"
modified_services=( ${modified_services[@]} )

echo $modified_services

exit 1
