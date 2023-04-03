/*
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
 */

export function stringifySelector(opts: any): string {
  const matchLabels: { [key: string]: any } = opts.matchLabels || {};
  const matchExpressions: { [key: string]: any } = opts.matchExpressions || [];

  return Object.keys(matchLabels)
    .map((key) => `${key}=${matchLabels[key]}`)
    .concat(
      matchExpressions.map((expr: { [key: string]: any }): string => {
        const operator: string = expr.operator.toLocaleLowerCase();
        const key: string = expr.key;
        const values: any = expr.values;

        switch (operator) {
          case 'exists':
            return key;
          case 'doesnotexist':
            return `!${key}`;
          default:
        }
        return `${key} ${operator} (${values.join(',')})`;
      }),
    )
    .join(',');
}
