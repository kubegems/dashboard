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
          @click="toPage(item)"
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
  import messages from '../../i18n';

  export default {
    name: 'StatusTag',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
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
            text: this.$t('tip.enabled_monitor'),
            notext: this.$t('tip.disabled_monitor'),
            status: this.m,
          },
          {
            key: 'l',
            name: 'Log',
            text: this.$t('tip.enabled_log'),
            notext: this.$t('tip.disabled_log'),
            status: this.l,
          },
          {
            key: 's',
            name: 'Mesh',
            text: this.$t('tip.enabled_mesh'),
            notext: this.$t('tip.disabled_mesh'),
            status: this.s,
          },
        ];
      },
    },
    methods: {
      setColor(status) {
        return status ? 'primary' : '';
      },
      toPage(item) {
        if (item.key === 'm' && item.status) {
          this.$router.push({
            name: 'observe-monitor-config',
            params: this.$route.params,
            query: {
              proj: this.item.projectName,
              env: this.item.environmentName,
              projid: this.item.projectID,
              envid: this.item.environmentID,
              cluster: this.item.clusterName,
              namespace: this.item.namespace,
              refresh: 1,
            },
          });
        } else if (item.key === 'l' && item.status) {
          this.$router.push({
            name: 'log-config',
            params: this.$route.params,
            query: {
              proj: this.item.projectName,
              env: this.item.environmentName,
              projid: this.item.projectID,
              envid: this.item.environmentID,
              cluster: this.item.clusterName,
              namespace: this.item.namespace,
              refresh: 1,
            },
          });
        }
      },
    },
  };
</script>
