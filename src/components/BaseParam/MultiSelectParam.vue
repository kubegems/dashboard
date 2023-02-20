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
    >
      <template v-if="param.items && param.items.type === 'object'" #action>
        <v-btn class="mt-n1" color="primary" icon small @click="addItem">
          <v-icon small>mdi-plus-box</v-icon>
        </v-btn>
      </template>
    </BaseSubTitle>
    <template v-if="param.items && param.items.type === 'object'">
      <div v-for="(item, ii) in list" :id="`${id}-${ii}`" :key="`${id}-${ii}`" class="grey lighten-5 rounded ma-3 pa-2">
        <v-btn class="float-right" color="error" icon small @click="removeItem(item, `${param.path}/${item}`)">
          <v-icon small>mdi-close-box</v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
        <BaseParam
          v-for="(childrenParam, index) in retrieveFromSchema(appValues, param.items, `${param.path}/${item}/`)"
          :id="`${id}-${index}`"
          :key="`${id}-${index}`"
          :all-params="allParams"
          :app-values="appValues"
          class="my-0 mt-0"
          :cluster-name="clusterName"
          :param="childrenParam"
          v-bind="$attrs"
          v-on="$listeners"
        />
      </div>
    </template>
    <template v-else-if="param.items && Array.isArray(param.items)">
      <BaseSubTitle class="mb-4" color="grey lighten-3" :divider="false" :title="param.title || param.path" />
      <template v-for="(childrenParam, iii) in param.items">
        <BaseParam
          v-for="(p, index) in retrieveFromSchema(
            appValues,
            {
              properties: {
                [iii]: {
                  ...childrenParam,
                  title: `${param.title}.${iii}`,
                  form: true,
                },
              },
            },
            `${param.path}/`,
          )"
          :id="`${id}-${index}`"
          :key="`${id}-${index}`"
          :all-params="allParams"
          :app-values="appValues"
          class="my-0 mt-0"
          :cluster-name="clusterName"
          :level="0"
          :param="p"
          v-bind="$attrs"
          v-on="$listeners"
        />
      </template>
    </template>
    <template v-else>
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
    </template>
  </v-flex>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { sleep } from '@/utils/helpers';
  import { retrieveFromSchema } from '@/utils/schema';

  export default {
    name: 'MultiSelectParamParam',
    mixins: [BaseResource, BaseSelect],
    props: {
      appValues: {
        type: Object,
        default: () => ({}),
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
        default: () => ({}),
      },
      level: {
        type: Number,
        default: () => 1,
      },
    },
    data() {
      return {
        items: [],
        selectedItems: [],
        search: null,
        list: [],
      };
    },
    computed: {
      pathLevel() {
        if (this.param?.path?.indexOf('/') > -1) return this.param.path.split('/').length;
        if (this.param?.path?.indexOf('.') > -1) return this.param.path.split('.').length;
        return this.level;
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
      if (this.param.items && Array.isArray(this.param.items)) return;
      this.onChange(this.selectedItems);
    },
    methods: {
      retrieveFromSchema: retrieveFromSchema,
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
      addItem() {
        this.list.push(this.list.length);
      },
      async removeItem(index, path) {
        this.$emit('changeBasicFormParam', this.param, '', 'deleted', path);
        await sleep(100);
        this.list = this.list.map((item, i) => {
          if (i > index) {
            item -= 1;
          }
          return item;
        });
        this.list.splice(index, 1);
      },
    },
  };
</script>
