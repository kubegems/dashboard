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
import requireComponent from '@kubegems/components';
import Vue from 'vue';

for (const path in Object.assign(requireComponent, import.meta.globEager('@/components/*.vue'))) {
  const pathArr: string[] = path.split('/');
  const length: number = pathArr.length;
  const componentName: string = pathArr[length - 1].split('.')[0];

  Vue.component(componentName, requireComponent[path].default);
}
