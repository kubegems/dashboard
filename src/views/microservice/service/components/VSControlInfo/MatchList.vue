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
  <v-data-table disable-sort :headers="headers" hide-default-footer :items="items" no-data-text="暂无数据">
    <template #[`item.rule`]="{ item }">
      <v-flex v-for="(v, k) in item.rule" :key="k"> {{ k }} => {{ v }} </v-flex>
    </template>
  </v-data-table>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'MatchList',
    mixins: [BaseResource],
    props: {
      matchs: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        items: [],
        headers: [
          { text: '匹配类型', value: 'type', align: 'start', width: '50%' },
          { text: '匹配规则', value: 'rule', align: 'start' },
        ],
      };
    },
    watch: {
      matchs: {
        handler: function () {
          this.items = [];
          if (this.matchs) {
            this.matchs.forEach((m) => {
              for (const key in m) {
                this.items.push({
                  type: key,
                  rule: m[key],
                });
              }
            });
          }
        },
        immediate: true,
      },
    },
  };
</script>
