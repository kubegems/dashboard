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
        {{ $t('resource.environment') }}
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
              @click="getProject"
            >
              <v-icon left>mdi-cloud</v-icon>
              {{ store.getters.Environment().EnvironmentName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat height="350px">
            <div class="select__left" :style="{ width: '180px' }">
              <div class="text-subtitle-2 kubegems__text select__title">
                <div class="float-left"> 选择一个环境 </div>
                <div v-if="state.loading" class="float-right">
                  <v-progress-circular color="primary" indeterminate size="18" width="3" />
                </div>
                <div class="kubegems__clear-float" />
              </div>

              <div class="text-caption pa-1 mt-2">{{ $t('resource.project') }}</div>
              <v-divider class="mb-2" />
              <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
                <v-list-item-group v-model="state.project" color="primary" @change="selectProject">
                  <v-list-item v-for="item in projectItems" :key="item.ID" dense>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        {{ item.ProjectName }}
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
                <div class="text-caption pa-1 mt-2">{{ $t('resource.environment') }}</div>
                <v-divider class="mb-2" />
                <v-list class="pa-0" dense max-height="225" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group v-model="state.environment" color="primary" @change="selectEnvironment">
                    <v-list-item v-for="item in environmentItems" :key="item.ID" dense>
                      <v-list-item-content>
                        <v-list-item-title class="select__list__title pl-2">
                          <div class="float-left">
                            {{ item.EnvironmentName }}
                            <div class="float-right text-caption ml-2 select__list__badge">{{ item.MetaType }}</div>
                          </div>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </div>
            </template>

            <template v-if="showCluster">
              <v-divider class="float-left select__divider" vertical />
              <div class="select__right" :style="{ width: '250px' }">
                <div class="text-caption pa-1 mt-2">
                  <div class="float-left">
                    <BaseLogo default-logo="kubernetes" :ml="0" :mt="0" :width="20" />
                  </div>
                  <div class="float-left ml-1"> 云端集群 </div>
                  <div class="kubegems__clear-float" />
                </div>
                <v-divider class="mb-2" />
                <v-list class="pa-0" dense max-height="225" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group color="primary" @change="selectCluster">
                    <v-list-item v-for="item in [environment]" :key="item" dense>
                      <v-list-item-content>
                        <v-list-item-title class="select__list__title pl-2">
                          {{ item ? item.Cluster.ClusterName : '' }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
                <div class="text-caption pa-1 mt-2">
                  <div class="float-left">
                    <BaseLogo default-logo="kubernetes" icon-name="k3s" :ml="0" :mt="0" :width="20" />
                  </div>
                  <div class="float-left ml-1"> 边缘集群 </div>
                  <div class="kubegems__clear-float" />
                </div>
                <v-divider class="mb-2" />
                <!-- <v-list class="pa-0" dense max-height="345" nav :style="{ overflowY: 'auto' }">
                  <v-list-item-group v-model="ruleIndex" color="primary" @change="onRuleChange">
                    <v-list-item v-for="(item, index) in ruleItemsCopy" :key="index" dense>
                      <v-list-item-content>
                        <v-tooltip :close-delay="200" right>
                          <template #activator="{ on }">
                            <v-list-item-title class="select__list__title pl-2" v-on="on" v-text="item.showName" />
                          </template>
                          <template #default>
                            <span class="text-caption">{{ item.description || $root.$t('data.no_data') }}</span>
                          </template>
                        </v-tooltip>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list> -->
              </div>
            </template>

            <div class="kubegems__clear-float" />
          </v-card>
        </v-menu>
      </v-sheet>

      <v-spacer />
      <v-sheet>
        <span class="text-body-2 kubegems__text">
          {{ $t('resource.project_c', [$t('resource.role')]) }}:
          {{ RESOURCE_ROLE[role] ? $t(`role.project.${role}`) : $t('data.unknown') }}
          <span class="ml-4">
            {{ $t('resource.environment_c', [$t('resource.type')]) }}:
            {{
              METATYPE_CN[store.getters.Environment().Type]
                ? $t(`metadata.environment_type.${store.getters.Environment().Type}`)
                : ''
            }}
          </span>
          <span class="ml-4">{{ $t('resource.project') }} : {{ store.getters.Project().ProjectName }}</span>
          <span class="ml-4">{{ $t('resource.cluster') }} : {{ store.getters.Environment().ClusterName }}</span>
          <span class="ml-4">{{ $t('resource.namespace') }} : {{ store.getters.Environment().Namespace }}</span>
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, defineProps, inject, reactive, watch } from 'vue';

  import { useEnvironmentRole } from '@/composition/permission';
  import { useEnvironmentListInProject, useProjectPagination } from '@/composition/project';
  import { useRoute, useRouter } from '@/composition/router';
  import { RESOURCE_ROLE, METATYPE_CN } from '@/constants/platform';
  import { useStore } from '@/store';
  import { Environment } from '@/types/environment';
  import { Project } from '@/types/project';

  withDefaults(
    defineProps<{
      selectable?: boolean;
    }>(),
    {
      selectable: true,
    },
  );

  type reloadHandler = () => void;

  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const reload: reloadHandler = inject('reload');
  const state = reactive({
    menu: false,
    search: undefined,
    width: 180,
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

  const project: ComputedRef<Project> = computed(() => {
    return state.projectPagination[state.project] as Project;
  });

  const environmentItems: ComputedRef<Environment[]> = computed(() => {
    return state.environmentPagination as Environment[];
  });

  const environment: ComputedRef<Environment> = computed(() => {
    return state.environmentPagination[state.environment] as Environment;
  });

  const showEnvironment: ComputedRef<boolean> = computed(() => {
    return state.project > -1 || state.environmentPagination?.length > 0;
  });

  const showCluster: ComputedRef<boolean> = computed(() => {
    return state.environment > -1;
  });

  watch(
    () => route.params.environment,
    async (value) => {
      state.loading = true;
      state.projectPagination = await useProjectPagination(
        new Project({ TenantID: store.getters.Tenant().ID }),
        1,
        100,
      );
      state.project = state.projectPagination.findIndex((project: Project) => {
        return project.ProjectName === route.params.project;
      });

      state.environmentPagination = await useEnvironmentListInProject(new Project(project.value), 1, 100);
      state.loading = false;
      state.environment = state.environmentPagination.findIndex((environment: Environment) => {
        return environment.EnvironmentName === value;
      });
    },
    {
      immediate: true,
    },
  );

  const role = useEnvironmentRole();

  const getProject = async (): Promise<void> => {
    state.loading = true;
    state.projectPagination = await useProjectPagination(new Project({ TenantID: store.getters.Tenant().ID }), 1, 100);
    state.loading = false;
  };

  const selectProject = async (): Promise<void> => {
    if (state.project > -1) {
      state.width = 460;
      state.environment = undefined;
      state.loading = true;
      state.environmentPagination = await useEnvironmentListInProject(new Project(project.value), 1, 100);
      state.loading = false;
    } else {
      state.width = 180;
    }
  };

  const selectEnvironment = async (): Promise<void> => {
    if (state.environment > -1) {
      state.width = 710;
      state.edgeClusterPagination = [];
    } else {
      state.width = 460;
    }
  };

  const selectCluster = async (isEdge = false): Promise<void> => {
    await router.replace({
      params: {
        tenant: store.getters.Tenant().TenantName,
        project: project.value.ProjectName,
        environment: isEdge ? '' : environment.value.EnvironmentName,
      },
      query: {
        timestamp: Date.parse(new Date().toString()).toString(),
      },
    });
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
</style>
