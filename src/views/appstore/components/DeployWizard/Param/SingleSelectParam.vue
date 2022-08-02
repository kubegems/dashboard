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
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-autocomplete
      :id="id"
      class="my-2"
      hide-selected
      :items="items"
      :label="pathLevel === 1 ? '' : label"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      :rules="titleRule"
      :value="param.value"
      @change="onChange($event)"
      @focus="onStorageClassSelectFocus"
    >
      <template #selection="{ item }">
        <v-chip class="mx-1" color="primary" small>
          {{ item['text'] }}
        </v-chip>
      </template>
    </v-autocomplete>
  </v-flex>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'SingleSelectParam',
    mixins: [BaseResource, BaseSelect],
    props: {
      clusterName: {
        type: String,
        default: () => '',
      },
      id: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      items: [],
      titleRule: [required],
    }),
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    watch: {
      // 如果选择了环境,得到集群名后,自动加载存储类选择列表
      clusterName() {
        if ((this.param.name === 'storageClassName' || this.param.name === 'storageClass') && this.clusterName !== '') {
          this.m_select_storageClassSelectData(this.clusterName, { noprocessing: true });
          this.items = this.m_select_storageClassItems;
        }
      },
    },
    mounted() {
      if (this.param.enum && this.param.enum.length > 0) {
        this.items = this.param.enum.map((enumValue) => {
          return { text: enumValue, values: enumValue };
        });
      }
      this.onStorageClassSelectFocus();
    },
    methods: {
      onChange(event) {
        this.$emit('changeBasicFormParam', this.param, event);
      },
      async onStorageClassSelectFocus() {
        if ((this.param.name === 'storageClassName' || this.param.name === 'storageClass') && this.clusterName !== '') {
          await this.m_select_storageClassSelectData(this.clusterName, { noprocessing: true });
          this.items = this.m_select_storageClassItems;
        }
      },
    },
  };
</script>
