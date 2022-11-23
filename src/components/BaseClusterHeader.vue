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
          v-model="state.menu"
          bottom
          :close-on-content-click="false"
          content-class="header__menu"
          max-height="350px"
          :min-width="state.width"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          right
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
            >
              <v-icon class="header__icon" left>mdi-kubernetes</v-icon>
              {{ store.getters.Cluster().ClusterName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat height="350px">
            <div class="select__left" :style="{ width: '220px' }">
              <div class="text-subtitle-2 kubegems__text select__title">
                <div class="float-left"> 选择一个集群 </div>
                <div v-if="state.loading" class="float-right">
                  <v-progress-circular color="primary" indeterminate size="18" width="3" />
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-caption pa-1 mt-2">集群类型</div>
              <v-divider class="mb-2" />
              <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
                <v-list-item-group v-model="state.clusterType" color="primary" @change="selectClusterType">
                  <v-list-item v-for="item in state.clusterTypes" :key="item.value" dense>
                    <v-list-item-avatar class="mr-0" size="28">
                      <BaseLogo default-logo="kubernetes" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        {{ item.text }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>
            <v-divider v-if="show" class="float-left select__divider" vertical />
            <div v-if="show" class="select__right" :style="{ width: '250px' }">
              <div class="text-caption pa-1">集群</div>
              <v-text-field
                v-model="state.search"
                class="mb-2"
                dense
                flat
                hide-details
                prepend-inner-icon="mdi-magnify"
                solo
                @keyup="search"
              />
              <v-divider class="mb-2" />
              <v-list class="pa-0" dense max-height="225" nav :style="{ overflowY: 'auto' }">
                <v-list-item-group v-model="state.cluster" color="primary" @change="selectCluster">
                  <v-list-item v-for="item in clusterItems" :key="item.ID" dense>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        <div class="float-left">
                          {{ item.ClusterName }}
                          <div class="float-right text-caption ml-2 select__list__badge">{{ item.Version }}</div>
                        </div>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>
            <div class="kubegems__clear-float" />
          </v-card>
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
          {{ store.getters.Cluster().ClusterName }}
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, inject, reactive, watch } from 'vue';

  import { useClusterList, useEdgeClusterList } from '@/composition/cluster';
  import { useRoute, useRouter } from '@/composition/router';
  import { useStore } from '@/store';
  import { Cluster } from '@/types/cluster';
  import { EdgeCluster } from '@/types/edge_cluster';

  withDefaults(
    defineProps<{
      selectable?: boolean;
    }>(),
    {
      selectable: true,
    },
  );

  // enum ClusterType {
  //   K8S,
  //   Edge,
  // }

  type reloadHandler = () => void;

  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const reload: reloadHandler = inject('reload');
  const state = reactive({
    menu: false,
    search: undefined,
    width: 220,
    clusterPagination: undefined,
    clusterType: undefined,
    cluster: undefined,
    clusterTypes: [
      { text: 'Kubernetes', icon: 'kubernetes', value: 'k8s' },
      { text: 'Edge Cluster', icon: 'k3s', value: 'edge' },
    ],
    loading: false,
  });

  const show: ComputedRef<boolean> = computed(() => {
    return state.clusterType > -1 || state.clusterPagination?.length > 0;
  });

  const clusterItems: ComputedRef<Cluster[]> = computed(() => {
    return state.clusterPagination as Cluster[];
  });

  const cluster: ComputedRef<Cluster> = computed(() => {
    return state.clusterPagination[state.cluster] as Cluster;
  });

  watch(
    () => route.params.cluster,
    async (value) => {
      state.loading = true;
      state.clusterPagination = !route.query.isEdge
        ? await useClusterList(new Cluster())
        : await useEdgeClusterList(new EdgeCluster());
      state.loading = false;
      state.clusterType = 0;
      state.cluster = state.clusterPagination.findIndex((cluster: Cluster) => {
        return cluster.ClusterName === value;
      });
    },
    {
      immediate: true,
    },
  );

  const selectClusterType = async (): Promise<void> => {
    if (state.clusterType > -1) {
      state.width = 470;
      state.loading = true;
      state.clusterPagination =
        state.clusterType === 0 ? await useClusterList(new Cluster()) : await useEdgeClusterList(new EdgeCluster());
      state.loading = false;
    } else {
      state.width = state.clusterPagination?.length > 0 ? 470 : 220;
    }
  };

  const selectCluster = async (): Promise<void> => {
    if (state.cluster > -1) {
      store.commit('SET_NAMESPACE_FILTER', null);
      await router.replace({
        params: { cluster: cluster.value.ClusterName },
        query: { ...route.query, namespace: null, page: '1' },
      });
      await store.dispatch('UPDATE_CLUSTER_DATA');
      state.menu = false;
      reload();
    }
  };

  const search = (): void => {
    if (state.search) {
      state.clusterPagination = state.clusterPagination.filter((cluster: Cluster) => {
        return cluster.ClusterName.indexOf(state.search) > -1;
      });
    } else {
      selectClusterType();
    }
  };
</script>

<style lang="scss" scoped>
  .header {
    &__menu {
      z-index: auto !important;
    }
  }

  .select {
    &__left {
      float: left;
      width: 45%;
      padding: 8px;
    }

    &__right {
      float: left;
      width: 55%;
      padding: 8px;
    }

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 100%;
      max-height: 100%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;

        > div {
          line-height: 24px;
        }
      }

      &__badge {
        background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
        padding: 0 4px;
        margin-top: 2px;
      }
    }
  }
</style>
