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
  <div class="d-inline-block">
    <v-menu v-for="(item, i) in items" :key="item.key" nudge-top="22px" open-on-hover top>
      <template #activator="{ on }">
        <v-btn
          :class="{ 'ml-2': i > 0, kubegems__text: !item.status }"
          :color="setColor(item.status)"
          depressed
          label
          :style="{ fontFamily: 'kubegems-sample' }"
          x-small
          v-on="on"
        >
          {{ item.name }}
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-2 text-caption">
          {{ item.status ? item.text : item.notext }}
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'StatusTag',
    props: {
      l: {
        type: Boolean,
        default: false,
      },
      m: {
        type: Boolean,
        default: false,
      },
      s: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      items() {
        return [
          {
            key: 'm',
            name: 'Metrics',
            text: '已启用监控',
            notext: '未启用监控',
            status: this.m,
          },
          {
            key: 'l',
            name: 'Log',
            text: '已启用日志',
            notext: '未启用日志',
            status: this.l,
          },
          {
            key: 's',
            name: 'Mesh',
            text: '已启用服务网格',
            notext: '未启用服务网格',
            status: this.s,
          },
        ];
      },
    },
    methods: {
      setColor(status) {
        return status ? 'primary' : '';
      },
    },
  };
</script>
