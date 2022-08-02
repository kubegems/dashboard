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
  <v-data-table disable-sort :headers="headers" hide-default-footer :items="routes" no-data-text="暂无数据">
    <template #[`item.destination`]="{ item }">
      {{ item.destination.host }}
    </template>
  </v-data-table>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'RouteList',
    mixins: [BaseResource],
    props: {
      routes: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        headers: [
          {
            text: '目标负载',
            value: 'destination',
            align: 'start',
            width: '50%',
          },
          { text: '流量权重', value: 'weight', align: 'start' },
        ],
      };
    },
  };
</script>
