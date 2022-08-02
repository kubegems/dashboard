import * as jsonpatch from 'fast-json-patch';
import { isEmpty, set } from 'lodash';
import YAML from 'yaml';

const YamlMixin = {
  methods: {
    // setValue modifies the current values (text) based on a path
    setValue(values, path, newValue = null) {
      const doc = YAML.parseDocument(JSON.stringify(values));
      const { splittedPath, value } = this.parsePathAndValue(doc, path, newValue);

      doc.setIn(splittedPath, value);
      // yaml转object
      return this.$yamlload(doc) || {};
    },
    setYamlValue(values, path, newValue = null) {
      const doc = YAML.parseDocument(values);
      const { splittedPath, value } = this.parsePathAndValue(doc, path, newValue);
      doc.setIn(splittedPath, value);
      // doc是YAML对象,先转为字符串再美化为yaml字符串
      return this.$yamldump(this.$yamlload(doc) || {});
    },

    getValue(values, path, defaultValue = null) {
      const doc = YAML.parseDocument(JSON.stringify(values));
      const splittedPath = this.parsePath(path);
      const value = doc.getIn(splittedPath);
      // 如果没有获取到值,则使用默认值
      return value === undefined || value === null ? defaultValue : value;
    },

    getValueSchema(values, path, defaultValue = null) {
      const doc = YAML.parseDocument(JSON.stringify(values));
      const splittedPath = this.parsePath(path);
      const value = doc.getIn(splittedPath);
      // 优先使用schema中的默认值
      return defaultValue || value;
    },
    parsePath(path) {
      return this.unescapePath(this.splitPath(path));
    },
    unescapePath(path) {
      // jsonpath escapes slashes to not mistake then with objects so we need to revert that
      return path.map((p) => jsonpatch.unescapePathComponent(p));
    },
    splitPath(path) {
      return (
        (path ?? '')
          // ignore the first slash, if exists
          .replace(/^\//, '')
          // split by slashes
          .split('/')
      );
    },
    parsePathAndValue(doc, path, value = null) {
      if (isEmpty(doc.contents)) {
        // If the doc is empty we have an special case
        return {
          value: set({}, path.replace(/^\//, ''), value),
          splittedPath: [],
        };
      }
      let splittedPath = this.splitPath(path);
      // If the path is not defined (the parent nodes are undefined)
      // We need to change the path and the value to set to avoid accessing
      // the undefined node. For example, if a.b is undefined:
      // path: a.b.c, value: 1 ==> path: a.b, value: {c: 1}
      // TODO(andresmgot): In the future, this may be implemented in the YAML library itself
      // https://github.com/eemeli/yaml/issues/131
      const allElementsButTheLast = splittedPath.slice(0, splittedPath.length - 1);
      const parentNode = doc.getIn(allElementsButTheLast);
      if (parentNode === undefined) {
        const definedPath = this.getDefinedPath(allElementsButTheLast, doc);
        const remainingPath = splittedPath.slice(definedPath.length + 1);
        value = set({}, remainingPath.join('.'), value);
        splittedPath = splittedPath.slice(0, definedPath.length + 1);
      }
      return { splittedPath: this.unescapePath(splittedPath), value };
    },
    getDefinedPath(allElementsButTheLast, doc) {
      let currentPath = [];
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
    },
  },
};

export { YamlMixin };
