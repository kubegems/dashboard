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
  <v-form v-if="mounts" ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-sheet v-for="(container, index) in initContainers" :key="index" class="px-2">
      <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
        {{ container.name }}(init)
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="mounts[container.name].readOnly"
          color="primary"
          hide-selected
          :items="readModes"
          label="挂载方式"
          no-data-text="暂无可选数据"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-if="mounts[container.name].readOnly !== null"
          v-model="mounts[container.name].mountPath"
          label="挂载路径"
          required
          :rules="mountRules[container.name].mountPathRule"
        />
      </v-flex>
      <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-if="mounts[container.name].readOnly !== null"
          v-model="mounts[container.name].subPath"
          label="子路径"
          :rules="mountRules[container.name].subPathRule"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </v-form>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { required } from '@/utils/rules';

  export default {
    name: 'VolumeMountForInitContainer',
    mixins: [BaseResource],
    props: {
      initContainers: {
        type: Array,
        default: () => [],
      },
      volume: {
        type: Object,
        default: () => null,
      },
      volumeMountName: {
        type: String,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        mounts: null,
      };
    },
    computed: {
      readModes() {
        if (this.volume && (this.volume.secret || this.volume.configmap)) {
          return [
            { text: '只读', value: true },
            { text: '不挂载', value: null },
          ];
        }
        return [
          { text: '只读', value: true },
          { text: '读写', value: false },
          { text: '不挂载', value: null },
        ];
      },
      mountRules() {
        const mountRules = {};
        this.initContainers.forEach((c) => {
          const rules = {};
          rules['mountPathRule'] = [required];
          rules['subPathRule'] = [(v) => !new RegExp('^/').test(v) || '相对路径'];
          mountRules[c.name] = rules;
        });
        return mountRules;
      },
    },
    mounted() {
      this.initVolumeMount();
    },
    methods: {
      initVolumeMount(volumeName = null) {
        const mounts = {};
        this.initContainers.forEach((c) => {
          if (!c.volumeMounts) c.volumeMounts = [];
          const volume = c.volumeMounts.find((v) => {
            return v.name === this.volumeMountName ? this.volumeMountName : '';
          });
          if (volume) {
            mounts[c.name] = {
              mountPath: volume.mountPath,
              readOnly: volume.readOnly ? volume.readOnly : false,
              name: volume.name,
              subPath: volume.subPath,
            };
          } else {
            mounts[c.name] = {
              mountPath: '',
              readOnly: null,
              name: this.volume ? this.volume.name : volumeName || '',
              subPath: '',
            };
          }
        });
        this.mounts = mounts;
      },
      generateData() {
        if (this.$refs.form.validate(true)) {
          return this.mounts;
        }
        return null;
      },
    },
  };
</script>
