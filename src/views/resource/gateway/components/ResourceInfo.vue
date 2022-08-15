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
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" :title="$t('tip.instance_count')">
          <template #content>
            {{ $t('tip.available', [gateway ? gateway.status.availableReplicas : 0]) }},
            {{ $t('tip.unavailable', [gateway ? gateway.spec.replicas - gateway.status.availableReplicas : 0]) }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Generation">
          <template #content>
            {{ gateway ? gateway.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$root.$t('resource.tenant')">
          <template #content>
            {{ gateway ? gateway.spec.tenant : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$root.$t('resource.type')">
          <template #content>
            {{
              gateway && gateway.spec && gateway.spec.type === 'LoadBalancer'
                ? $t('tip.loadbalancer')
                : $t('tip.nodeport')
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.default_domain')">
          <template #content>
            {{ gateway ? gateway.spec.baseDomain : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.extend_label')">
          <template #content>
            <BaseCollapseChips
              v-if="gateway"
              id="r_gateway"
              :chips="gateway.spec.workload.extraLabels || {}"
              icon="mdi-label"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.port')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ $t('table.container_port') }}</th>
              <th class="text-left">{{ $t('table.service_port') }}</th>
              <th class="text-left">{{ $t('table.host_port') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in gateway ? gateway.status.ports : []" :key="index">
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  {{ item.targetPort }} | {{ item.protocol }}
                </v-chip>
              </td>
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  {{ item.port }} | {{ item.protocol }}
                </v-chip>
              </td>
              <td>{{ item.nodePort }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.address')" />
      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTP</v-flex>
      <v-simple-table class="mx-2 pa-2 rounded">
        <template #default>
          <tbody>
            <tr
              v-for="(item, index) in addresses.filter((a) => {
                return a.Addr.indexOf('http://') > -1;
              })"
              :key="index"
            >
              <td :style="{ width: `50%` }">{{ item.Addr }}</td>
              <td :style="{ width: `45%` }">
                <template v-if="item.Ready">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                  {{ $t('status.normal') }}
                </template>
                <template v-else>
                  <v-icon color="error" small> mdi-close-circle </v-icon>
                  {{ $t('status.error') }}
                </template>
              </td>
              <td :style="{ textAlign: `end` }">
                <v-btn color="primary" text x-small @click="toAddress(item.Addr)"> {{ $t('operate.access') }} </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTPS</v-flex>
      <v-simple-table class="mx-2 pa-2 rounded">
        <template #default>
          <tbody>
            <tr
              v-for="(item, index) in addresses.filter((a) => {
                return a.Addr.indexOf('https://') > -1;
              })"
              :key="index"
            >
              <td :style="{ width: `50%` }">{{ item.Addr }}</td>
              <td :style="{ width: `45%` }">
                <template v-if="item.Ready">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                  {{ $t('status.normal') }}
                </template>
                <template v-else>
                  <v-icon color="error" small> mdi-close-circle </v-icon>
                  {{ $t('status.error') }}
                </template>
              </td>
              <td :style="{ textAlign: `end` }">
                <v-btn color="primary" text x-small @click="toAddress(item.Addr)"> {{ $t('operate.access') }} </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getGatewayAddressList, getGatewayDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        gateway: null,
        addresses: [],
      };
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
    },
    watch: {
      item() {
        this.gateway = deepCopy(this.item);
        this.gatewayDetail();
      },
    },
    mounted() {
      if (this.item) {
        this.gateway = deepCopy(this.item);
        this.gatewayDetail();
      }
    },
    methods: {
      async gatewayDetail() {
        const data = await getGatewayDetail(this.Tenant().ID, this.ThisClusterID, this.$route.params.name, {
          noprocessing: true,
        });
        this.gateway = data;
        this.gatewayAddressList();
      },
      async gatewayAddressList() {
        const data = await getGatewayAddressList(this.Tenant().ID, this.ThisClusterID, this.$route.params.name, {
          noprocessing: true,
        });
        this.addresses = data || [];
      },
      toAddress(address) {
        window.open(address);
      },
    },
  };
</script>
