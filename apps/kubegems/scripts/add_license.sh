#!/usr/bin/env bash
# exit immediately when a command fails
set -e
# only exit with zero if all commands of the pipeline exit successfully
set -o pipefail
# error on unset variables
set -u

header='<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->'

noLicenseFiles=$(
    find . -type f -iname '*.vue' ! -path '*/node_modules/*' -exec sh -c 'head -n4 $1 | grep -Eq "(Copyright|generated|GENERATED)" || echo $1' {} {} \;
)

for path in $noLicenseFiles; do
echo -e "$header\n" | cat - $path > temp && mv temp $path
done
