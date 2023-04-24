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
        {{ i18n.t('resource.environment') }}
        <v-menu
          v-model="state.menu"
          bottom
          :close-on-content-click="false"
          content-class="header__menu"
          max-height="380px"
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
                :icon-name="store.state.Edge ? 'k3s' : 'kubegems'"
                :ml="0"
                :width="20"
              />
              {{ store.getters.Environment().EnvironmentName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat height="380px">
            <div class="select__left" :style="{ width: '250px' }">
              <div class="text-subtitle-2 kubegems__text select__title">
                <div class="float-left"> {{ i18n.t('tip.select_one_env') }} </div>
                <div v-if="state.loading" class="float-right">
                  <v-progress-circular color="primary" indeterminate size="18" width="3" />
                </div>
                <div class="kubegems__clear-float" />
              </div>

              <div class="text-caption pa-1 mt-2">{{ i18n.t('resource.project') }}</div>
              <v-divider class="mb-2" />
              <v-list class="pa-0" dense max-height="280" nav :style="{ overflowY: 'auto' }">
                <v-list-item-group v-model="state.project" color="primary" @change="selectProject">
                  <v-list-item v-for="(item, index) in projectItems" :key="index" dense>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        {{ item.ProjectName }}
                        <div class="text-caption"> {{ item.Remark }} </div>
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>

            <template v-if="showEnvironment">
              <v-divider class="float-left select__divider" vertical />
              <div class="select__right" :style="{ width: '280px' }">
                <v-text-field
                  v-model="state.search"
                  class="mt-2"
                  dense
                  flat
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  solo
                  @keyup="search"
                />
                <div class="text-caption pa-1 mt-2">{{ i18n.t('resource.environment') }}</div>
                <v-divider class="mb-2" />
                <v-list class="pa-0" dense max-height="245" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group v-model="state.environment" color="primary" @change="selectEnvironment">
                    <v-list-item v-for="item in environmentItems" :key="item.EnvironmentName" dense>
                      <v-list-item-content>
                        <v-list-item-title class="select__list__title pl-2">
                          <div class="float-left">
                            {{ item.EnvironmentName }}
                          </div>
                          <v-chip class="float-right mt-1" :color="METATYPE_CN[item.MetaType].color" label x-small>
                            {{ i18n.t(`metadata.environment_type.${item.MetaType}`) }}
                          </v-chip>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </div>
            </template>

            <template v-if="showCluster">
              <v-divider class="float-left select__divider" vertical />
              <div class="select__right" :style="{ minWidth: '280px' }">
                <div class="text-caption pa-1 mt-2">
                  <div class="float-left">
                    <BaseLogo default-logo="kubernetes" :ml="0" :mt="0" :width="20" />
                  </div>
                  <div class="float-left ml-1"> {{ i18n.t('resource.cloud_cluster') }} </div>
                  <div class="kubegems__clear-float" />
                </div>
                <v-divider class="mb-2" />
                <v-list class="pa-0" dense max-height="225" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group color="primary" :value="store.state.Edge ? undefined : 0" @change="selectCluster">
                    <v-list-item v-for="(item, index) in [environment]" :key="index" dense>
                      <v-list-item-content>
                        <v-list-item-title class="select__list__title pl-2">
                          {{ item && item.Cluster ? item.Cluster.ClusterName : '' }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
                <div class="text-caption pa-1 mt-2">
                  <div class="float-left">
                    <BaseLogo default-logo="kubernetes" icon-name="k3s" :ml="0" :mt="0" :width="20" />
                  </div>
                  <div class="float-left ml-1"> {{ i18n.t('resource.edge_cluster') }} </div>
                  <div class="kubegems__clear-float" />
                </div>
                <v-divider class="mb-2" />
                <v-list class="pa-0" dense max-height="225" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group v-model="state.edgeCluster" color="primary" @change="selectCluster(true)">
                    <v-list-item v-for="item in edgeClusterItems" :key="item.ClusterName" dense>
                      <v-list-item-content>
                        <v-list-item-title class="select__list__title pl-2">
                          <div>
                            <div class="float-left mr-2">
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
            </template>

            <div class="kubegems__clear-float" />
          </v-card>
        </v-menu>
      </v-sheet>
      <v-sheet v-else class="text-subtitle-1">
        {{ i18n.t('resource.environment') }}
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
            :icon-name="store.state.Edge ? 'k3s' : 'kubegems'"
            :ml="0"
            :width="20"
          />
          {{ store.getters.Environment().EnvironmentName }}
        </v-btn>
      </v-sheet>

      <span v-if="store.state.Edge" class="text-body-2 kubegems__text">
        <span class="ml-2">{{ i18n.t('resource.edge_cluster') }} : {{ store.state.Edge }}</span>
      </span>

      <v-spacer />
      <v-sheet>
        <span class="text-body-2 kubegems__text">
          {{ i18n.t('resource.project_c', [i18n.t('resource.role')]) }}:
          {{ RESOURCE_ROLE[role] ? i18n.t(`role.project.${role}`) : i18n.t('data.unknown') }}
          <span class="ml-4">
            {{ i18n.t('resource.environment_c', [i18n.t('resource.type')]) }}:
            {{
              METATYPE_CN[store.getters.Environment().Type]
                ? i18n.t(`metadata.environment_type.${store.getters.Environment().Type}`)
                : ''
            }}
          </span>
          <span class="ml-4">{{ i18n.t('resource.project') }} : {{ store.getters.Project().ProjectName }}</span>
          <span class="ml-4">{{ i18n.t('resource.cluster') }} : {{ store.getters.Environment().ClusterName }}</span>
          <span class="ml-4">{{ i18n.t('resource.namespace') }} : {{ store.getters.Environment().Namespace }}</span>
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { useEdgeClusterList } from '@kubegems/api/hooks/cluster';
  import { useEnvironmentListInProject } from '@kubegems/api/hooks/project';
  import { useProjectListInTenant } from '@kubegems/api/hooks/tenant';
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Project } from '@kubegems/api/typed/project';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useEnvironmentRole } from '@kubegems/extension/permission';
  import { useName, useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@kubegems/libs/constants/label';
  import { METATYPE_CN, RESOURCE_ROLE } from '@kubegems/libs/constants/platform';
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
  const routeName = useName();
  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload') as reloadHandler;
  const state = reactive<any>({
    menu: false,
    search: undefined,
    width: 250,
    project: undefined,
    projectPagination: undefined,
    environment: undefined,
    environmentPagination: undefined,
    cloudCluster: undefined,
    edgeCluster: undefined,
    edgeClusterPagination: undefined,
    loading: false,
  });

  const projectItems: ComputedRef<Project[]> = computed(() => {
    return state.projectPagination as Project[];
  });

  const environmentItems: ComputedRef<Environment[]> = computed(() => {
    return state.environmentPagination as Environment[];
  });

  const showEnvironment: ComputedRef<boolean> = computed(() => {
    return state.project > -1 || state.environmentPagination?.length > 0;
  });

  const showCluster: ComputedRef<boolean> = computed(() => {
    return state.environment > -1;
  });

  const edgeClusterItems: ComputedRef<Cluster[]> = computed(() => {
    return state.edgeClusterPagination as Cluster[];
  });

  const params = useParams();
  const fillData = async (): Promise<void> => {
    state.loading = true;
    state.projectPagination = await useProjectListInTenant(new Tenant({ ID: store.getters.Tenant().ID }));
    state.project = state.projectPagination.findIndex((project: Project) => {
      return project?.ProjectName === params.value.project;
    });

    state.environmentPagination = await useEnvironmentListInProject(new Project(project.value));
    state.loading = false;
    state.environment = state.environmentPagination.findIndex((environment: Environment) => {
      return environment.EnvironmentName === params.value.environment;
    });
    if (state.environment > -1) {
      if (environment.value.AllowEdgeRegistration) {
        state.edgeClusterPagination = await useEdgeClusterList(new EdgeCluster(), {
          [ENVIRONMENT_KEY]: [params.value.environment],
          [PROJECT_KEY]: [params.value.project],
          [TENANT_KEY]: [params.value.tenant],
        });
        state.edgeCluster = state.edgeClusterPagination.findIndex((edgeCluster: Cluster) => {
          return edgeCluster.ClusterName === store.state.Edge;
        });
      }
    }
  };

  const role = useEnvironmentRole();

  const project: ComputedRef<Project> = computed(() => {
    return state.projectPagination[state.project] as Project;
  });
  const selectProject = async (): Promise<void> => {
    if (state.project > -1) {
      state.width = 460;
      state.environment = undefined;
      state.loading = true;
      state.environmentPagination = await useEnvironmentListInProject(new Project(project.value));
      state.loading = false;
    } else {
      state.width = 250;
    }
  };

  const environment: ComputedRef<Environment> = computed(() => {
    return state.environmentPagination[state.environment] as Environment;
  });
  const selectEnvironment = async (): Promise<void> => {
    if (state.environment > -1) {
      state.width = 740;
      if (environment.value.AllowEdgeRegistration)
        state.edgeClusterPagination = await useEdgeClusterList(new EdgeCluster(), {
          [ENVIRONMENT_KEY]: [environment.value.EnvironmentName],
          [PROJECT_KEY]: [project.value?.ProjectName],
          [TENANT_KEY]: [params.value.tenant],
        });
      else state.edgeClusterPagination = [];
    } else {
      state.width = 460;
    }
  };

  const cluster: ComputedRef<Cluster> = computed(() => {
    return state.edgeClusterPagination[state.edgeCluster] as Cluster;
  });
  let name: string = routeName.value;
  let query = useQuery().value;
  let param = params.value;
  const selectCluster = async (isEdge = false): Promise<void> => {
    if (isEdge) {
      if (cluster.value?.Status === 'Online') {
        store.commit('SET_EDGE', cluster.value.ClusterName);
        if (routeName.value === 'environment-detail') {
          name = 'edge-detail';
          query = { ...query, edgeName: cluster.value.ClusterName };
          param = { ...param, name: cluster.value.ClusterName };
        }
      } else {
        store.commit('SET_SNACKBAR', {
          text: i18n.t('tip.node_offline'),
          color: 'warning',
        });
        return;
      }
    } else {
      store.commit('SET_EDGE', '');
      await store.dispatch('INIT_PLUGINS', environment.value.Cluster?.ClusterName);
      if (routeName.value === 'edge-detail') {
        name = 'environment-detail';
        query = {};
      }
    }
    await router.replace({
      name: name,
      params: {
        ...param,
        tenant: store.getters.Tenant().TenantName,
        project: project.value?.ProjectName,
        environment: environment.value.EnvironmentName,
      },
      query: {
        ...query,
        timestamp: Date.parse(new Date().toString()).toString(),
      },
    });
    state.menu = false;
    reload();
  };

  const search = (): void => {
    if (state.search) {
      state.environmentPagination = state.environmentPagination.filter((environment: Environment) => {
        return environment.EnvironmentName.indexOf(state.search) > -1;
      });
    } else {
      selectProject();
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
