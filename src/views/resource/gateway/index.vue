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
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto gateway__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" size="80" tile>
                <img src="/icon/nginx.svg" :style="{ width: `80px`, height: `80px`, marginLeft: `10px` }" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a @click="gatewayDetail(item)">
                    {{ item && item.metadata ? item.metadata.name : '' }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $root.$t('resource.type') }} : </span>
                  {{
                    item && item.spec && item.spec.type === 'LoadBalancer' ? $t('tip.loadbalancer') : $t('tip.nodeport')
                  }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $t('tip.instance_count') }} : </span>
                  {{ item && item.spec && item.spec.replicas === '' ? '-' : item.spec.replicas }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $root.$t('resource.tenant') }} : </span>
                  {{ item && item.spec && item.spec.tenant === '' ? '-' : item.spec.tenant }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2">
                    {{ $t('tip.status') }} :
                    <v-icon
                      v-if="item && item.spec && item.status && item.spec.replicas === item.status.availableReplicas"
                      color="success"
                      small
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-icon v-else-if="item.status && item.status.availableReplicas === 0" color="error" small>
                      mdi-close-circle
                    </v-icon>
                    <v-icon v-else color="warning" small> mdi-alert-circle </v-icon>
                  </span>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $t('tip.port') }} : </span>
                  <span v-for="(port, index) in item ? item && item.status && item.status.ports : []" :key="index">
                    {{ port.name === '' ? '-' : port.name }}:
                    {{ port.nodePort === '' ? '-' : port.nodePort }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" small text @click="gatewayDetail(item)"> {{ $root.$t('operate.detail') }} </v-btn>
              <v-btn color="primary" small text @click="updateGateway(item)"> {{ $root.$t('operate.edit') }} </v-btn>
              <v-btn v-if="item.spec.tenant !== 'notenant'" color="error" small text @click="removeGateway(item)">
                {{ $root.$t('operate.delete') }}
              </v-btn>
            </v-card-actions>
            <v-flex v-if="item.spec.tenant === 'notenant'" class="gateway__watermark-bg" />
            <v-flex v-if="item.spec.tenant === 'notenant'" class="gateway__watermark font-weight-medium">
              {{ $t('tip.default') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
      <v-col v-if="m_permisson_resourceAllow" class="pt-0" cols="3">
        <v-card class="full-height" flat min-height="211">
          <v-card-text class="pa-0 full-height">
            <v-list-item class="full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addGateway">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.gateway')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddGateway ref="addGateway" @refresh="gatewayList" />
    <UpdateGateway ref="updateGateway" @refresh="gatewayList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddGateway from './components/AddGateway';
  import UpdateGateway from './components/UpdateGateway';
  import messages from './i18n';
  import { deleteGateway, getGatewayList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Gateway',
    i18n: {
      messages: messages,
    },
    components: {
      AddGateway,
      UpdateGateway,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data: () => ({
      items: [],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Tenant', 'Cluster']),
    },
    mounted() {
      if (this.JWT) {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_cluster'),
            color: 'warning',
          });
          return;
        }
        this.gatewayList();
      }
    },
    methods: {
      async gatewayList() {
        const data = await getGatewayList(this.AdminViewport ? '_all' : this.Tenant().ID, this.ThisClusterID, {
          size: 1000,
        });
        this.items = data;
      },
      addGateway() {
        this.$refs.addGateway.open();
      },
      updateGateway(item) {
        this.$refs.updateGateway.init(item.metadata.name);
        this.$refs.updateGateway.open();
      },
      gatewayDetail(item) {
        this.$router.push({
          name: 'gateway-detail',
          params: Object.assign(this.$route.params, { name: item.metadata.name }),
        });
      },
      removeGateway(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteGateway(this.Tenant().ID, this.ThisClusterID, param.item.metadata.name);
              this.gatewayList();
            }
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .gateway {
    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 120px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 17px;
      right: 1px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
  .full-height {
    height: 100%;
  }
</style>
