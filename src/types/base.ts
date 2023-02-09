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
declare global {
  type KubeRequest = {
    [params: string]: any;
  };

  type KubeResponse<T, U> = {
    Data: T;
    Message: string;
    ErrorData: U;

    data: T;
    message: string;
  };

  type KubePaginationRequest = {
    size: number;
    page: number;
    [params: string]: any;
  };

  type KubePaginationResponse<T> = {
    List: T;
    CurrentPage: number;
    CurrentSize: number;
    Total: number;

    list: T;
    page: number;
    size: number;
    total: number;
  };

  type Pagination<T> = {
    items: T[];
    size: number;
    pageCount: number;
    page: number;
    total?: number;
    [params: string]: any;
  };
}

export function initDefaultValueFromKModel(
  attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }>,
): { [key: string]: any } {
  const data = {};
  attributeTypeMap.forEach((attribute) => {
    if (attribute.type === 'string') data[attribute.name] = '';
    else if (attribute.type === 'number') data[attribute.name] = 0;
    else if (attribute.type === '{ [key: string]: string; }') data[attribute.name] = {};
    else if (attribute.type === 'Date') data[attribute.name] = new Date();
    else if (attribute.type === 'string') data[attribute.name] = '';
    else if (attribute.type.startsWith('Array')) data[attribute.name] = [];
    else data[attribute.name] = {};
  });
  return data;
}

export {};
