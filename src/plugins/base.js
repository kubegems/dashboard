import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import Vue from 'vue';

const requireComponent = import.meta.globEager('@/components/*.vue');

for (const path in requireComponent) {
  let pathArr = path.split('/');
  let length = pathArr.length;
  const componentName = upperFirst(camelCase(pathArr[length - 1].split('.')[0]));

  Vue.component(componentName, requireComponent[path].default);
}
