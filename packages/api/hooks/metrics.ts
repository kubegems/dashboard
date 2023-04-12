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

export const getUnitItems = (u: { [key: string]: any } = undefined): { [key: string]: string }[] => {
  const items = [];
  const us = u || units;
  Object.keys(us).forEach((unit) =>
    us[unit].value.forEach((u) => {
      if (unit === 'short') {
        items.push({
          text: `${us[unit].cn}`,
          value: `${unit}`,
        });
      } else {
        items.push({
          text: `${us[unit].cn}/${u}`,
          value: `${unit}-${u}`,
        });
      }
    }),
  );
  return items;
};

export const units: { [key: string]: any } = {
  short: {
    cn: 'default',
    value: ['n', 'u', 'm', '', 'K', 'Mil', 'Bil', 'Tri'],
  },
  bytes: {
    cn: 'byte',
    value: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
  },
  'bytes/sec': {
    cn: 'byte rate',
    value: ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'],
  },
  duration: {
    cn: 'time',
    value: ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'],
  },
  percent: {
    cn: 'precent',
    value: ['0.0-1.0', '0-100'],
  },
};

export const addCustomUnit = (unit: string): { [key: string]: any } => {
  if (
    !getUnitItems().some((u) => {
      return u.value === unit;
    })
  ) {
    units['custom'] = { cn: 'custom', value: [unit] };
  }
  return units;
};
