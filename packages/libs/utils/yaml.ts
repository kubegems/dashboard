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

import * as jsonpatch from 'fast-json-patch';
import yaml from 'js-yaml';
import { isEmpty, set } from 'lodash';
import * as YAML from 'yaml';

export const setValue = (
  values: { [key: string]: any },
  path: string,
  newValue: any = null,
): { [key: string]: any } => {
  const doc = YAML.parseDocument(JSON.stringify(values));
  const { splittedPath, value } = parsePathAndValue(doc, path, newValue);

  doc.setIn(splittedPath, value);
  // yaml转object
  return yaml.load(doc) || {};
};

export const deleteValue = (values: { [key: string]: any }, path: string): { [key: string]: any } => {
  const doc = YAML.parseDocument(JSON.stringify(values));
  const { splittedPath } = parsePathAndValue(doc, path, '');

  doc.deleteIn(splittedPath);
  // yaml转object
  return yaml.load(doc) || {};
};

export const setYamlValue = (values: string, path: string, newValue = ''): string => {
  const doc = YAML.parseDocument(values);
  const { splittedPath, value } = parsePathAndValue(doc, path, newValue);
  doc.setIn(splittedPath, value);
  // doc是YAML对象,先转为字符串再美化为yaml字符串
  return yaml.dump(yaml.load(doc) || {});
};

export const getValue = (values: { [key: string]: any }, path: string, defaultValue: any = null): any => {
  const doc = YAML.parseDocument(JSON.stringify(values));
  const splittedPath = parsePath(path);
  const value = doc.getIn(splittedPath);
  // 如果没有获取到值,则使用默认值
  return value === undefined || value === null ? defaultValue : value;
};

export const getValueSchema = (values: { [key: string]: any }, path: string, defaultValue: any = null): any => {
  const doc = YAML.parseDocument(JSON.stringify(values));
  const splittedPath = parsePath(path);
  const value = doc.getIn(splittedPath);

  return value === undefined || value === null ? defaultValue : value;
};

export const parsePath = (path: string): string[] => {
  return unescapePath(splitPath(path));
};

export const unescapePath = (path: string[]): string[] => {
  // jsonpath escapes slashes to not mistake then with objects so we need to revert that
  return path.map((p) => jsonpatch.unescapePathComponent(p));
};

export const splitPath = (path: string): string[] => {
  if (path?.indexOf('/') > -1) {
    return (
      // ignore the first slash, if exists
      path
        .replace(/^\//, '')
        // split by slashes
        .split('/')
    );
  } else if (path?.indexOf('.') > -1) {
    return (
      // ignore the first slash, if exists
      path
        .replace(/^\//, '')
        // split by slashes
        .split('.')
    );
  }
  return [path];
};

export const parsePathAndValue = (
  doc: YAML.Document.Parsed<YAML.ParsedNode>,
  path: string,
  value: any = '',
): { [key: string]: any } => {
  if (isEmpty(doc.contents)) {
    // If the doc is empty we have an special case
    return {
      value: set({}, path.replace(/^\//, ''), value),
      splittedPath: [],
    };
  }
  let splittedPath = splitPath(path);
  // If the path is not defined (the parent nodes are undefined)
  // We need to change the path and the value to set to avoid accessing
  // the undefined node. For example, if a.b is undefined:
  // path: a.b.c, value: 1 ==> path: a.b, value: {c: 1}
  // TODO(andresmgot): In the future, this may be implemented in the YAML library itself
  // https://github.com/eemeli/yaml/issues/131
  const allElementsButTheLast = splittedPath.slice(0, splittedPath.length - 1);
  const parentNode = doc.getIn(allElementsButTheLast);
  if (parentNode === undefined) {
    const definedPath = getDefinedPath(allElementsButTheLast, doc);
    const remainingPath = splittedPath.slice(definedPath.length + 1);
    value = set({}, remainingPath.join('.'), value);
    splittedPath = splittedPath.slice(0, definedPath.length + 1);
  }
  return { splittedPath: unescapePath(splittedPath), value };
};

export const getDefinedPath = (
  allElementsButTheLast: string[],
  doc: YAML.Document.Parsed<YAML.ParsedNode>,
): string[] => {
  let currentPath: string[] = [];
  let foundUndefined = false;
  allElementsButTheLast.forEach((p) => {
    // Iterate over the path until finding an element that is not defined
    if (!foundUndefined) {
      const pathToEvaluate = currentPath.concat(p);
      const elem = doc.getIn(pathToEvaluate);
      if (elem === undefined || elem === null) {
        foundUndefined = true;
      } else {
        currentPath = pathToEvaluate;
      }
    }
  });
  return currentPath;
};
