import Vue from 'vue';

const requireComponent: any = import.meta.globEager('@/components/*.vue');

for (const path in requireComponent) {
  const pathArr: string[] = path.split('/');
  const length: number = pathArr.length;
  const componentName: string = pathArr[length - 1].split('.')[0];

  Vue.component(componentName, requireComponent[path].default);
}
