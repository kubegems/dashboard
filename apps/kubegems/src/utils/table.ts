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

export const sortBy = (name: string, param: { [key: string]: any } = {}): { [key: string]: any } => {
  if (name) {
    param['name'] = name;
    param['desc'] = null;
  } else {
    param['name'] = null;
  }
  return param;
};

export const sortDesc = (desc: boolean, param: { [key: string]: any } = {}): { [key: string]: any } => {
  if (desc) {
    param['desc'] = desc;
  } else {
    param['desc'] = null;
  }
  return param;
};

export const generateResourceSortParamValue = (param: { [key: string]: any } = {}): string | null => {
  if (param.name === 'name') {
    return `name${param.desc ? 'Desc' : 'Asc'}`;
  } else if (param.name === 'createAt') {
    return `createTime${param.desc ? 'Asc' : 'Desc'}`;
  } else if (param.name === 'age') {
    return `createTime${param.desc ? 'Asc' : 'Desc'}`;
  } else if (param.name === 'status') {
    return `status${param.desc ? 'Desc' : 'Asc'}`;
  } else if (param.name === 'appName') {
    return `name${param.desc ? 'Desc' : 'Asc'}`;
  } else if (param.name === 'createdAt') {
    return `createTime${param.desc ? 'Desc' : 'Asc'}`;
  }
  return null;
};
