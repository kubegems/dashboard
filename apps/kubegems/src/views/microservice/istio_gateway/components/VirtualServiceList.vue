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
    <v-card-text>
      <v-data-table
        class="pb-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :no-data-text="$root.$t('data.no_data')"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.hosts`]="{ item, index }">
          <BaseCollapseChips
            v-if="item"
            :id="`v_host_${index}`"
            :chips="item.spec.hosts || []"
            icon="mdi-directions-fork"
            single-line
          />
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'VirtualServiceList',
    i18n: {
      messages: messages,
    },
    props: {
      gateway: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
      };
    },
    computed: {
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.host'), value: 'hosts', align: 'start', width: 300 },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
        ];
      },
    },
    watch: {
      gateway: {
        handler() {
          if (this.gateway) {
            this.items = this.gateway.VirtualServices;
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
