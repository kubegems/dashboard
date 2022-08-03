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
        type === 'integer'
      "
      :id="id"
      :input-type="getInputType"
      :label="param.title || param.path"
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
      :input-type="getInputType"
      :label="param.title || param.path"
      :param="param"
      v-on="$listeners"
    />
    <!-- 多选组件 -->
    <MultiSelectParam
      v-else-if="type === 'array'"
      :id="id"
      v-bind="$attrs"
      :cluster-name="clusterName"
      :input-type="getInputType"
      :label="param.title || param.path"
      :param="param"
      v-on="$listeners"
    />
    <!-- 滑块带范围的组件 -->
    <MinMaxParam
      v-else-if="type === 'string' && param.render && param.render === 'slider'"
      :id="id"
      :label="param.title || param.path"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 文本框组件 -->
    <TextAreaParam
      v-else-if="type === 'string' && param.render && param.render === 'textArea'"
      :id="id"
      :label="param.title || param.path"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </v-flex>
</template>

<script>
  import BooleanParam from './BooleanParam';
  import MinMaxParam from './MinMaxParam';
  import MultiSelectParam from './MultiSelectParam';
  import SingleSelectParam from './SingleSelectParam';
  import TextAreaParam from './TextAreaParam';
  import TextFieldParam from './TextFieldParam';
  import { YamlMixin } from '@/views/appstore/mixins/yaml';

  export default {
    name: 'Param',
    components: {
      BooleanParam,
      MinMaxParam,
      MultiSelectParam,
      SingleSelectParam,
      Subsection: () => import('@/views/appstore/components/Subsection'),
      TextAreaParam,
      TextFieldParam,
    },
    mixins: [YamlMixin],
    props: {
      allParams: {
        type: Array,
        default: () => [],
      },
      appValues: {
        type: Object,
        default: () => {},
      },
      clusterName: {
        type: String,
        default: () => '',
      },
      id: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
    },
    computed: {
      isHiddle() {
        const hidden = this.param.hidden;
        switch (typeof hidden) {
          case 'string':
            return this.evalCondition(hidden);
          case 'object':
            // Two type of supported objects
            // A single condition: {value: string, path: any}
            // An array of conditions: {conditions: Array<{value: string, path: any}, operator: string}
            if (hidden.conditions?.length > 0) {
              // If hidden is an object, a different logic should be applied
              // based on the operator
              switch (hidden.operator) {
                case 'and':
                  // Every value matches the referenced
                  // value (via jsonpath) in all the conditions 每个条件返回值为真时隐藏
                  return hidden.conditions.every((c) => this.evalCondition(c.path, c.value));
                case 'or':
                  // It is enough if the value matches the referenced
                  // value (via jsonpath) in any of the conditions 只要有一个条件返回值为真时隐藏
                  return hidden.conditions.some((c) => this.evalCondition(c.path, c.value));
                case 'nor':
                  // Every value mismatches the referenced
                  // value (via jsonpath) in any of the conditions 或非, 与and相反, 所有条件返回值为假时隐藏
                  return hidden.conditions.every((c) => !this.evalCondition(c.path, c.value));
                case 'not':
                  // 非, 与对应的枚举类型关联
                  return hidden.conditions.every((c) => this.evalConditionNot(c.path, c.value));
                default:
                  // we consider 'and' as the default operator  默认,每个条件返回值为真时隐藏
                  return hidden.conditions.every((c) => this.evalCondition(c.path, c.value));
              }
            } else {
              return this.evalCondition(hidden.path, hidden.value);
            }
          case 'undefined':
            return false;
          default:
            return false;
        }
      },
      type() {
        return Array.isArray(this.param.type) ? this.param.type[0] : this.param.type;
      },
      getInputType() {
        const label = this.param.title || this.param.path;
        let inputType = 'string';
        if (this.type === 'integer') {
          inputType = 'number';
        }
        if (
          this.type === 'string' &&
          (this.param.render === 'password' || label.toLocaleLowerCase().includes('password'))
        ) {
          inputType = 'password';
        }
        return inputType;
      },
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    methods: {
      evalCondition(path, expectedValue = null) {
        // 从最新的appValues中获取路径对应的值
        let val = this.getValue(this.appValues, path);
        if (val === undefined) {
          const target = this.getParamMatchingPath(this.allParams, path);
          val = target?.value;
        }
        return val === (expectedValue ?? true);
      },
      evalConditionNot(path, expectedValue = null) {
        let val = this.getValue(this.appValues, path);
        if (val === undefined) {
          const target = this.getParamMatchingPath(this.allParams, path);
          val = target?.value;
          if (val === undefined) {
            const target = this.getParamMatchingPath(this.allParams, path);
            val = target?.value;
          }
        }
        // 不相等则返回真,表示隐藏该属性
        return val !== expectedValue;
      },
      // 递归获取匹配路径的参数
      getParamMatchingPath(params, path) {
        let targetParam;
        for (const p of params) {
          if (p.path === path) {
            targetParam = p;
            break;
          } else if (p.children && p.children?.length > 0) {
            targetParam = this.getParamMatchingPath(p.children, path);
          }
        }
        return targetParam;
      },
    },
  };
</script>
