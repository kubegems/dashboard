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
  <div class="mt-6">
    <DashboardCard :item="item" />

    <v-card class="mt-3">
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="Api">
          <template #content>
            <v-chip color="primary" small>
              {{ item && item.status ? item.status.url : '' }}
              <v-btn icon small @click="openAPIAddress(item)">
                <v-icon color="white" small> mdi-open-in-new </v-icon>
              </v-btn>
            </v-chip>
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail :title="$t('tip.protocol')">
          <template #content>
            <v-chip color="primary" small>
              {{ item ? item.spec.server.protocol : '' }}
            </v-chip>
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.params')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ $root.$t('form.key') }}</th>
              <th class="text-left">{{ $root.$t('form.value') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in item ? item.spec.server.parameters : []" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.port')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ $t('tip.port_name') }}</th>
              <th class="text-left">{{ $t('tip.container_port') }}</th>
              <th class="text-left">{{ $t('tip.host_address') }}</th>
              <th class="text-left">{{ $t('tip.host_port') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in item ? item.spec.server.ports : []" :key="index">
              <td>{{ item.name }}</td>
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  {{ item.containerPort }} | {{ item.protocol }}
                </v-chip>
              </td>
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  {{ item.hostPort }} | {{ item.protocol }}
                </v-chip>
              </td>
              <td>{{ item.hostIp }}</td>
              <td>{{ item.hostPort }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import messages from '../../i18n';
  import DashboardCard from './DashboardCard';

  export default {
    name: 'ModelResourceInfo',
    i18n: {
      messages: messages,
    },
    components: {
      DashboardCard,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      openAPIAddress(item) {
        window.open(item?.status?.url);
      },
    },
  };
</script>
