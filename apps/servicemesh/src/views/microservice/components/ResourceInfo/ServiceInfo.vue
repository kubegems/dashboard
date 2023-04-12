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
  <div>
    <v-card class="px-2" flat>
      <BaseListItemForDetail :mt="0" :title="$t('table.label')">
        <template #content>
          <BaseCollapseChips v-if="item" id="s_label" :chips="item.service.labels || {}" icon="mdi-label" single-line />
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail :title="$root.$t('resource.type')">
        <template #content>
          {{ item ? item.service.type : '' }}
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail title="Endpoints">
        <template #content>
          <v-flex v-for="(endpoint, index) in item ? item.endpoints : []" :key="index">
            <v-flex v-for="(address, index) in endpoint.addresses" :key="index" class="mb-1">
              {{ address.ip }}
            </v-flex>
          </v-flex>
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail :title="$t('table.service_ip')">
        <template #content>
          {{ item ? item.service.ip : '' }}
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail :title="$t('table.port')">
        <template #content>
          <v-flex class="text-body-2">
            <BaseCollapseChips v-if="item" id="s_port" :chips="services || []" icon="mdi-directions-fork" single-line />
          </v-flex>
        </template>
      </BaseListItemForDetail>
    </v-card>
  </div>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'ServiceInfo',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        services: [],
      };
    },
    watch: {
      item() {
        this.services = [];
        this.item.service.ports.forEach((s) => {
          if (s.nodePort !== undefined) {
            this.services.push(`${s.port}:${s.nodePort} ｜ ${s.protocol}`);
          } else {
            this.services.push(`${s.port} ｜ ${s.protocol}`);
          }
        });
      },
    },
  };
</script>
