<!--
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
-->

<template>
  <!-- 1级对象列宽为一半,其他全宽 -->
  <v-flex v-if="!isHiddle" class="pb-1">
    <!-- 对象子组件 -->
    <Subsection
      v-if="type === 'object'"
      :id="id"
      :all-params="allParams"
      :app-values="appValues"
      :cluster-name="clusterName"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      :path-level="pathLevel"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 布尔组件 -->
    <BooleanParam
      v-else-if="type === 'boolean'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 文本框组件(排除滑块类) -->
    <TextFieldParam
      v-else-if="
        (type === 'string' &&
          !param.render &&
          !param.enum &&
          param.name !== 'storageClassName' &&
          param.name !== 'storageClass' &&
          param.name !== 'nameOverride' &&
          param.name !== 'fullnameOverride') ||
        type === 'integer' ||
        type === 'number'
      "
      :id="id"
      :allow-delete="allowDelete"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 单选组件(枚举/存储类) -->
    <SingleSelectParam
      v-else-if="
        type === 'string' &&
        ((param.enum && param.enum.length > 0) || param.name === 'storageClassName' || param.name === 'storageClass')
      "
      :id="id"
      v-bind="$attrs"
      :cluster-name="clusterName"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-on="$listeners"
    />
    <!-- 多选组件 -->
    <MultiSelectParam
      v-else-if="type === 'array'"
      :id="id"
      v-bind="$attrs"
      :app-values="appValues"
      :cluster-name="clusterName"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-on="$listeners"
    />
    <!-- 滑块带范围的组件 -->
    <MinMaxParam
      v-else-if="type === 'string' && param.render && param.render === 'slider'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 文本框组件 -->
    <TextAreaParam
      v-else-if="type === 'string' && param.render && param.render === 'textArea'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </v-flex>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed } from 'vue';

  import BooleanParam from './BooleanParam.vue';
  import MinMaxParam from './MinMaxParam.vue';
  import MultiSelectParam from './MultiSelectParam.vue';
  import SingleSelectParam from './SingleSelectParam.vue';
  import Subsection from './Subsection.vue';
  import TextAreaParam from './TextAreaParam.vue';
  import TextFieldParam from './TextFieldParam.vue';
  import { getValue } from '@/utils/yaml';

  const props = withDefaults(
    defineProps<{
      id?: string;
      param?: any;
      level?: number;
      clusterName?: string;
      allParams?: any[];
      appValues?: any;
      allowDelete?: boolean;
    }>(),
    {
      id: undefined,
      param: {},
      level: 1,
      clusterName: '',
      allParams: undefined,
      appValues: {},
      allowDelete: false,
    },
  );

  const isHiddle: ComputedRef<boolean> = computed(() => {
    const hidden = props.param.hidden;
    switch (typeof hidden) {
      case 'string':
        return evalCondition(hidden);
      case 'object':
        // Two type of supported objects
        // A single condition: {value: string, path: any}
        // An array of conditions: {conditions: Array<{value: string, path: any}, operator: string}
        if (hidden.conditions?.length > 0) {
          switch (hidden.operator) {
            case 'and':
              // Every value matches the referenced
              // value (via jsonpath) in all the conditions 每个条件返回值为真时隐藏
              return hidden.conditions.every((c) => evalCondition(c.path, c.value));
            case 'or':
              // It is enough if the value matches the referenced
              // value (via jsonpath) in any of the conditions 只要有一个条件返回值为真时隐藏
              return hidden.conditions.some((c) => evalCondition(c.path, c.value));
            case 'nor':
              // Every value mismatches the referenced
              // value (via jsonpath) in any of the conditions 或非, 与and相反, 所有条件返回值为假时隐藏
              return hidden.conditions.every((c) => !evalCondition(c.path, c.value));
            case 'not':
              // 非, 与对应的枚举类型关联
              return hidden.conditions.every((c) => evalConditionNot(c.path, c.value));
            default:
              // we consider 'and' as the default operator  默认,每个条件返回值为真时隐藏
              return hidden.conditions.every((c) => evalCondition(c.path, c.value));
          }
        } else {
          return evalCondition(hidden.path, hidden.value);
        }
      case 'undefined':
        return false;
      default:
        return false;
    }
  });

  const type: ComputedRef<string> = computed(() => {
    return Array.isArray(props.param.type) ? props.param.type[0] : props.param.type;
  });

  const inputType: ComputedRef<string> = computed(() => {
    const label = props.param.title || props.param.path || '';
    let inputType = 'string';
    if (type.value === 'integer' || type.value === 'number') {
      inputType = 'number';
    }
    if (
      type.value === 'string' &&
      (props.param.render === 'password' || label.toLocaleLowerCase().includes('password'))
    ) {
      inputType = 'password';
    }
    return inputType;
  });

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const evalCondition = (path: string, expectedValue: any = null): boolean => {
    // 从最新的appValues中获取路径对应的值
    let val = getValue(props.appValues, path);
    if (val === undefined || val === null) {
      const target = getParamMatchingPath(props.allParams, path.replaceAll('.', '/'));
      val = target?.value;
    }
    return val === (expectedValue ?? true);
  };

  const evalConditionNot = (path: string, expectedValue: any = null): boolean => {
    let val = getValue(props.appValues, path);
    if (val === undefined) {
      const target = getParamMatchingPath(props.allParams, path);
      val = target?.value;
      if (val === undefined) {
        const target = getParamMatchingPath(props.allParams, path);
        val = target?.value;
      }
    }
    // 不相等则返回真,表示隐藏该属性
    return val !== expectedValue;
  };

  // 递归获取匹配路径的参数
  const getParamMatchingPath = (params: { [key: string]: any }[], path: string) => {
    for (const p of params) {
      if (p.path === path) {
        return p;
      } else if (p.children && p.children?.length > 0) {
        const pp = getParamMatchingPath(p.children, path);
        if (pp) return pp;
        else continue;
      } else {
        continue;
      }
    }
  };
</script>
