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
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto cluster__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" size="80" tile>
                <BaseLogo :icon-name="item.Vendor" :width="70" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a @click="clusterDetail(item)">{{ item.ClusterName }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $t('table.kubernetes_version') }} : </span>
                  {{ item.Version === '' ? '-' : item.Version }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> APIServer : </span>
                  {{ item.APIServer === '' ? '-' : item.APIServer }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $t('table.kubeconfig_expired') }} : </span>
                  <span v-if="isExpiredSoon(item)" class="error--text">
                    {{ item.ClientCertExpireAt === '' ? '-' : $moment(item.ClientCertExpireAt).format('ll') }}(即将到期)
                  </span>
                  <span v-else>
                    {{ item.ClientCertExpireAt === '' ? '-' : $moment(item.ClientCertExpireAt).format('ll') }}
                  </span>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ $t('table.status') }} : </span>
                  <template v-if="!item.Status">
                    <v-progress-circular color="warning" indeterminate size="16" width="3" />
                  </template>
                  <v-icon v-else-if="item.Status === 0" color="error" small> mdi-heart-broken </v-icon>
                  <v-icon v-else color="success" small> mdi-heart-pulse </v-icon>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" :disabled="!item.Status" small text @click="clusterDetail(item)">
                {{ $root.$t('operate.detail') }}
              </v-btn>
              <v-btn color="primary" :disabled="!item.Status" small text @click="updateCluster(item)">
                {{ $root.$t('operate.edit') }}
              </v-btn>
              <v-btn color="error" small text @click="removeCluster(item)"> {{ $root.$t('operate.delete') }} </v-btn>
              <v-btn color="primary" :disabled="!item.Status" small text @click="kuberCtl(item)"> Kubectl </v-btn>
            </v-card-actions>

            <v-flex v-if="item.Primary" class="cluster__watermark-bg" />
            <v-flex v-if="item.Primary" class="cluster__watermark font-weight-medium">
              {{ $t('tip.control_cluster') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
      <v-col class="pt-0" cols="3">
        <v-card class="kubegems__full-height" flat min-height="168">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addCluster">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.add_c', [$root.$t('resource.cluster')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddCluster ref="addCluster" :control="hasControllerCluster" @refresh="clusterList" />
    <UpdateCluster ref="updateCluster" @refresh="clusterList" />
    <Terminal ref="terminal" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddCluster from './components/AddCluster';
  import UpdateCluster from './components/UpdateCluster';
  import messages from './i18n';
  import { deleteCluster, getClusterList, getClusterStatus } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'Cluster',
    i18n: {
      messages: messages,
    },
    components: {
      AddCluster,
      Terminal,
      UpdateCluster,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      items: [],
      interval: null,
      hasControllerCluster: false,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Cluster']),
    },
    destroyed() {
      if (this.interval) clearInterval(this.interval);
    },
    mounted() {
      if (this.JWT) {
        this.clusterList();
        this.$store.commit('SET_NAMESPACE_FILTER', null);
      }
    },
    methods: {
      async clusterList(del = false) {
        const data = await getClusterList({ noprocessing: true });
        this.items = data.List;
        this.hasControllerCluster = this.items.some((c) => {
          return c.Primary;
        });
        this.updateClusterUrl(del);
        this.clusterStatus(false);
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
          this.clusterStatus(true);
        }, 30 * 1000);
      },
      updateClusterUrl(del = false) {
        let params = {};
        if (this.items?.length > 0) {
          if (this.$route.params?.cluster && !del) {
            params = this.$route.params;
          } else {
            params = { cluster: this.items[0].ClusterName };
          }
        }
        this.$router.replace({
          name: this.$route.name,
          params: params,
          query: { ...this.$route.query, timestamp: Date.parse(new Date()) },
        });
      },
      async clusterStatus(noprocess = false) {
        const data = await getClusterStatus({
          noprocessing: noprocess,
        });
        this.items.forEach((item, index) => {
          if (item.ClusterName) {
            item.Status = data[item.ClusterName];
            this.$set(this.items, index, item);
          }
        });
      },
      clusterDetail(item) {
        this.$router.push({
          name: 'cluster-detail',
          params: Object.assign(this.$route.params, { name: item.ClusterName }),
          query: { id: item.ID },
        });
      },
      addCluster() {
        this.$refs.addCluster.open();
      },
      updateCluster(item) {
        this.$refs.updateCluster.init(item);
        this.$refs.updateCluster.open();
      },
      kuberCtl(item) {
        this.$refs.terminal.init(null, item, 'kubectl');
        this.$refs.terminal.open();
      },
      removeCluster(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.cluster')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.cluster')])} ${item.ClusterName}`,
            type: 'delete',
            name: item.ClusterName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteCluster(param.item.ID);
            this.$store.commit('CLEAR_CLUSTER');
            this.$store.dispatch('UPDATE_VIRTUALSPACE_DATA');
            this.clusterList(true);
          },
        });
      },
      isExpiredSoon(item) {
        const expiredAt = this.$moment(item.ClientCertExpireAt);
        const now = this.$moment();
        return new Date(now.add(14, 'days')) > new Date(expiredAt);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .cluster {
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
</style>
