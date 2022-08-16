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
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">{{ $t('table.env') }}</th>
          <th class="text-left">{{ $root.$t('resource.type') }}</th>
          <th class="text-left">{{ $root.$t('form.value') }}(value/name(key)/fieldPath/containerName(resource))</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in envs" :key="index">
          <td>{{ item.name }} ({{ item.containerName }})</td>
          <td>{{ getType(item) }}</td>
          <td>{{ getValue(item) }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'DetailEnv',
    i18n: {
      messages: messages,
    },
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        envs: [],
      };
    },
    watch: {
      containers: {
        handler(newValue) {
          this.envs = [];
          newValue.forEach((c) => {
            if (c.env) {
              this.envs = this.envs.concat(
                c.env.map((e) => {
                  return { ...e, containerName: c.name };
                }),
              );
            }
          });
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      getType(item) {
        if (Object.prototype.hasOwnProperty.call(item, 'value')) {
          return 'key-value';
        }
        if (item?.valueFrom?.secretKeyRef) {
          return 'secret';
        }
        if (item?.valueFrom?.configMapKeyRef) {
          return 'configmap';
        }
        if (item?.valueFrom?.fieldRef) {
          return 'downward (pod)';
        }
        if (item?.valueFrom?.resourceFieldRef) {
          return 'downward (container)';
        }
        return 'unknown';
      },
      getValue(item) {
        if (Object.prototype.hasOwnProperty.call(item, 'value')) {
          return item.value;
        }
        if (item?.valueFrom?.secretKeyRef) {
          return `${item.valueFrom.secretKeyRef?.name} (${item.valueFrom.secretKeyRef?.key})`;
        }
        if (item?.valueFrom?.configMapKeyRef) {
          return `${item.valueFrom.configMapKeyRef?.name} (${item.valueFrom.configMapKeyRef?.key})`;
        }
        if (item?.valueFrom?.fieldRef) {
          return item.valueFrom.fieldRef?.fieldPath;
        }
        if (item?.valueFrom?.resourceFieldRef) {
          return `${item.valueFrom.resourceFieldRef?.containerName} (${item.valueFrom.resourceFieldRef?.resource})`;
        }
        return 'unknown';
      },
    },
  };
</script>
