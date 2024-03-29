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
        {{ store.state.Edge ? i18n.t('resource.edge_cluster') : i18n.t('resource.cluster') }}
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
              @click="fillData"
            >
              <BaseLogo
                class="mr-2 logo"
                default-logo="kubernetes"
                :icon-name="store.state.Edge ? 'k3s' : 'kubernetes'"
                :ml="0"
                :width="20"
              />
              {{ store.state.Edge || store.getters.Cluster().ClusterName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat height="350px">
            <div class="select__left" :style="{ width: '220px' }">
              <div class="text-subtitle-2 kubegems__text select__title">
                <div class="float-left"> {{ i18n.t('tip.select_one_cluster') }} </div>
                <div v-if="state.loading" class="float-right">
                  <v-progress-circular color="primary" indeterminate size="18" width="3" />
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-caption pa-1 mt-2">{{ i18n.t('tip.cluster_type') }}</div>
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
            <div v-if="show" class="select__right" :style="{ minWidth: '280px' }">
              <div class="text-caption pa-1">{{ i18n.t('resource.cluster') }}</div>
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
                  <v-list-item v-for="item in clusterItems" :key="item.ClusterName" dense>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        <div>
                          <div v-if="state.clusterType === 1" class="float-left mr-2">
                            <BaseStatus
                              :bg-color="edgeStatus[item.Status]"
                              :flashing="edgeStatus[item.Status] === edgeStatus.Waiting"
                              :show-text="false"
                            />
                          </div>
                          {{ item.ClusterName }}
                          <div v-if="item.DisplayName" class="pl-5 text-caption"> {{ item.DisplayName }} </div>
                          <div class="float-right text-caption ml-2 select__list__badge">
                            {{ item.Version }}
                          </div>
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
        {{ i18n.t('resource.cluster') }}
        <v-btn
          class="primary--text text-subtitle-1 font-weight-medium mt-n1"
          color="white"
          dark
          depressed
          small
          @click.stop
        >
          <BaseLogo
            class="mr-2 logo"
            default-logo="kubernetes"
            :icon-name="state.clusterType ? 'k3s' : 'kubernetes'"
            :ml="0"
            :width="20"
          />
          {{ store.state.Edge || store.getters.Cluster().ClusterName }}
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { useClusterList, useEdgeClusterList } from '@kubegems/api/hooks/cluster';
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { ComputedRef, computed, inject, reactive } from 'vue';

  withDefaults(
    defineProps<{
      selectable?: boolean;
    }>(),
    {
      selectable: true,
    },
  );

  const edgeStatus = {
    Online: 'var(--success-color)',
    Offline: 'var(--grey-light-color)',
    Waiting: 'var(--warning-color)',
  };

  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();
  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload') as reloadHandler;
  const state = reactive<any>({
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

  const params = useParams();
  const fillData = async (): Promise<void> => {
    state.loading = true;
    state.clusterPagination = store.state.Edge
      ? await useEdgeClusterList(new EdgeCluster())
      : await useClusterList(new Cluster());
    state.loading = false;
    state.clusterType = store.state.Edge ? 1 : 0;
    state.cluster = state.clusterPagination.findIndex((cluster: Cluster) => {
      return cluster.ClusterName === params.value.cluster;
    });
  };

  const selectClusterType = async (): Promise<void> => {
    if (state.clusterType > -1) {
      state.width = 470;
      state.loading = true;
      state.cluster = undefined;
      state.clusterPagination =
        state.clusterType === 0 ? await useClusterList(new Cluster()) : await useEdgeClusterList(new EdgeCluster());
      state.loading = false;
    } else {
      state.width = state.clusterPagination?.length > 0 ? 500 : 220;
    }
  };

  const cluster: ComputedRef<Cluster> = computed(() => {
    return state.clusterPagination[state.cluster] as Cluster;
  });
  const selectCluster = async (): Promise<void> => {
    if (state.cluster > -1) {
      store.commit('SET_NAMESPACE_FILTER', null);
      if (state.clusterType === 1) {
        if (cluster.value.Status === 'Online') {
          store.commit('SET_EDGE', cluster.value.ClusterName);
        } else {
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.node_offline'),
            color: 'warning',
          });
          return;
        }
      } else {
        store.commit('SET_EDGE', '');
      }
      await router.replace({
        params: { cluster: cluster.value.ClusterName },
        query: { ...query.value, namespace: null, page: '1' },
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
      padding: 8px;
    }

    &__right {
      float: left;
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

  .logo {
    margin-top: 6px !important;
  }
</style>
