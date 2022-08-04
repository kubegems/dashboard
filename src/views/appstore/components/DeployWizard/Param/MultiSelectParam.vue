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
    <v-combobox
      v-model="selectedItems"
      :attach="`#${id}`"
      class="my-2"
      hide-selected
      :items="items"
      :label="pathLevel === 1 ? '' : label"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      multiple
      :search-input.sync="search"
      @change="onChange($event)"
    >
      <template #no-data>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              {{ search }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-chip
          class="ma-1"
          close
          close-icon="mdi-close-circle"
          color="success"
          dense
          small
          @click:close="removeCommand(item)"
        >
          {{ item }}
        </v-chip>
      </template>
      <template #append-outer><v-flex :id="id" /></template>
    </v-combobox>
  </v-flex>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'MultiSelectParamParam',
    mixins: [BaseResource, BaseSelect],
    props: {
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
      selectedItems: [],
      search: null,
    }),
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    mounted() {
      // yaml seq 序列转json的array
      if (this.param.items && this.param.items.enum && this.param.items.enum.length > 0) {
        const enums = this.param.items.enum;
        // 去重
        this.items = [...new Set(enums)];
      }
      if (this.param.default && this.param.default.length > 0) {
        this.selectedItems = this.param.default;
      }
      this.onChange(this.selectedItems);
    },
    methods: {
      onChange(event) {
        this.$emit('changeBasicFormParam', this.param, event);
      },
      removeCommand(item) {
        const tmp = this.selectedItems.filter((selectItem) => {
          return selectItem !== item;
        });
        this.selectedItems = tmp;
        this.$emit('changeBasicFormParam', this.param, this.selectedItems);
      },
    },
  };
</script>
