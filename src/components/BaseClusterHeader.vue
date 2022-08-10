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
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" flat height="60">
    <v-card-title class="py-3 mt-n3" :style="{ height: `60px` }">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        {{ $t('resource.cluster') }}
        <v-menu
          v-model="clusterMenu"
          bottom
          content-class="cluster-header__bg"
          left
          max-height="300px"
          max-width="220px"
          min-width="120px"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              color="white"
              dark
              depressed
              small
              v-on="on"
              @click.stop="getCluster"
            >
              <v-icon class="header__icon" left>mdi-kubernetes</v-icon>
              {{ Cluster().ClusterName }}
              <v-icon v-if="clusterMenu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            hide-default-footer
            :items="[{ text: $t('resource.cluster'), values: m_select_clusterItems }]"
          >
            <template #no-data>
              <v-card>
                <v-card-text> {{ $t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat :loading="loading">
                <v-list class="pb-3" dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ $t('resource.cluster') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <div class="header__list px-2">
                    <v-list-item
                      v-for="(cluster, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="{ color: cluster.text === Cluster().ClusterName ? `#1e88e5 !important` : `` }"
                      @click="setCluster(cluster)"
                    >
                      <v-list-item-content class="text-body-2 font-weight-medium text-start">
                        <div class="kubegems__break-all">
                          <v-icon color="primary" left small>mdi-kubernetes</v-icon>
                          {{ cluster.text }}
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <v-sheet v-else class="text-subtitle-1">
        {{ $t('resource.cluster') }}
        <v-btn
          class="primary--text text-subtitle-1 font-weight-medium mt-n1"
          color="white"
          dark
          depressed
          small
          @click.stop
        >
          <v-icon class="header__icon" left>mdi-kubernetes</v-icon>
          {{ Cluster().ClusterName }}
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'BaseClusterHeader',
    mixins: [BaseResource, BaseSelect],
    inject: ['reload'],
    props: {
      selectable: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => ({
      clusterMenu: false,
      loading: false,
    }),
    computed: {
      ...mapGetters(['Cluster']),
    },
    methods: {
      async setCluster(item) {
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        await this.$router.replace({
          params: { cluster: item.text },
          query: {
            ...this.$route.query,
            ...{ namespace: null },
            ...{ page: 1 },
          },
        });
        await this.$store.dispatch('UPDATE_CLUSTER_DATA');
        this.reload();
      },
      async getCluster() {
        this.loading = true;
        await this.m_select_clusterSelectData(null);
        this.loading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .cluster-header__bg {
    z-index: auto !important;
  }

  .header {
    &__list {
      max-height: 250px;
      overflow-y: auto;
    }
  }
</style>
