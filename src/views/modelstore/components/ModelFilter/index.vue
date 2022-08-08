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
  <v-card>
    <v-card-text class="pa-0 pl-2 pb-2">
      <BaseSubTitle class="pt-2 mb-1" :divider="false" title="算法模型">
        <template #action>
          <span class="text-body-2 kubegems__text mr-2"> 模型总数:{{ modelCount }} </span>
        </template>
      </BaseSubTitle>
      <v-text-field
        v-model="search"
        class="mr-4 my-2 ml-2"
        flat
        hide-details
        label="算法模型名称"
        prepend-inner-icon="mdi-magnify"
        solo
        @keyup.enter="onSearch"
      />
      <div class="mt-4">
        <FilterItems :tags="tasks" title="Task" @search="onFilterSeach" />
      </div>
      <div class="mt-4">
        <FilterItems :tags="frameworks" title="Framework" @search="onFilterSeach" />
      </div>
      <div class="mt-4">
        <FilterItems :tags="licenses" title="License" @search="onFilterSeach" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import FilterItems from './FilterItems';
  import { getModelStoreFilterCondition } from '@/api';

  export default {
    name: 'ModelFilter',
    components: {
      FilterItems,
    },
    props: {
      modelCount: {
        type: Number,
        default: () => 0,
      },
      registry: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        search: '',
        frameworks: [],
        licenses: [],
        tasks: [],
      };
    },
    watch: {
      registry: {
        handler(newValue) {
          if (newValue) {
            this.modelStoreFilterCondition();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.search = this.$route.query.search || '';
      });
    },
    methods: {
      onSearch() {
        this.$emit('search', this.search);
      },
      onFilterSeach(filter) {
        this.$emit('filter', filter);
      },
      async modelStoreFilterCondition() {
        const data = await getModelStoreFilterCondition(this.registry.name);
        this.tasks = data.tasks;
        this.frameworks = data.frameworks;
        this.licenses = data.licenses;
      },
    },
  };
</script>
