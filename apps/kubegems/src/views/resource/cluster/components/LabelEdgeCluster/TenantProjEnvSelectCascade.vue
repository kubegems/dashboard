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
  <v-menu
    v-model="state.menu"
    bottom
    :close-on-content-click="false"
    max-height="380px"
    :min-width="state.width"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-autocomplete
        class="my-0"
        color="primary"
        hide-no-data
        :items="[
          {
            text: labels && labels[ENVIRONMENT_KEY] ? labels[ENVIRONMENT_KEY] : '',
            value: labels && labels[ENVIRONMENT_KEY] ? labels[ENVIRONMENT_KEY] : '',
          },
        ]"
        :label="
          i18n.t('operate.allocate_c', [
            `${i18n.t('resource.tenant')}${i18n.t('resource.project')}${i18n.t('resource.environment')}`,
          ])
        "
        multiple
        :no-data-text="$root.$t('data.no_data')"
        :value="environmentModel ? environmentModel.EnvironmentName : undefined"
        v-on="on"
        @focus="fillData"
      >
        <template #selection>
          <v-chip v-if="environmentModel" color="primary" small>
            <span>
              {{
                labels && labels[ENVIRONMENT_KEY]
                  ? `${i18n.t('resource.tenant')}:${labels[TENANT_KEY]}-${i18n.t('resource.project')}:${
                      labels[PROJECT_KEY]
                    }-${i18n.t('resource.environment')}:${labels[ENVIRONMENT_KEY]}`
                  : ''
              }}
            </span>
          </v-chip>
        </template>
      </v-autocomplete>
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

        <div class="text-caption pa-1 mt-2">{{ i18n.t('resource.tenant') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="280" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="state.tenant" color="primary" @change="selectTenant">
            <v-list-item v-for="item in tenantItems" :key="item.TenantName" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.TenantName }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>

      <template v-if="showProject">
        <v-divider class="float-left select__divider" vertical />
        <div class="select__right" :style="{ width: '250px' }">
          <div class="text-caption pa-1 mt-2">{{ i18n.t('resource.project') }}</div>
          <v-divider class="mb-2" />
          <v-list class="pa-0" dense max-height="285" nav :style="{ overflowY: 'auto' }">
            <v-list-item-group v-model="state.project" color="primary" @change="selectProject">
              <v-list-item v-for="item in projectItems" :key="item.ProjectName" dense>
                <v-list-item-content>
                  <v-list-item-title class="select__list__title pl-2">
                    {{ item.ProjectName }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </template>

      <template v-if="showEnvironment">
        <v-divider class="float-left select__divider" vertical />
        <div class="select__right" :style="{ minWidth: '250px' }">
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
          <div class="text-caption pa-1 mt-2"> {{ i18n.t('resource.environment') }} </div>
          <v-divider class="mb-2" />
          <v-list class="pa-0" dense max-height="245" nav :style="{ overflowY: 'auto' }">
            <v-list-item-group v-model="state.environment" color="primary" @change="selectEnvironment">
              <v-list-item v-for="item in environmentItems" :key="item.EnvironmentName" dense>
                <v-list-item-content>
                  <v-list-item-title class="select__list__title pl-2">
                    {{ item.EnvironmentName }}
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
</template>

<script lang="ts" setup>
  import { useEnvironmentListInProject } from '@kubegems/api/hooks/project';
  import { useProjectListInTenant, useTenantList } from '@kubegems/api/hooks/tenant';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Project } from '@kubegems/api/typed/project';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@kubegems/libs/constants/label';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  const i18n = useGlobalI18n();

  const props = withDefaults(
    defineProps<{
      labels?: { [key: string]: string | number | boolean };
    }>(),
    {
      labels: undefined,
    },
  );

  const state = reactive({
    menu: false,
    search: undefined,
    width: 250,
    loading: false,
    tenant: undefined,
    project: undefined,
    environment: undefined,
  });

  const showProject: ComputedRef<boolean> = computed(() => {
    return state.tenant > -1 || projectItems.value?.length > 0;
  });

  const showEnvironment: ComputedRef<boolean> = computed(() => {
    return state.project > -1 || environmentItems.value?.length > 0;
  });

  const tenantItems = ref<Tenant[]>([]);
  const tenantModel: ComputedRef<Tenant> = computed(() => {
    return tenantItems.value[state.tenant];
  });

  const labels = ref({});
  const fillData = async (): Promise<void> => {
    state.loading = true;
    tenantItems.value = await useTenantList(new Tenant());
    state.loading = false;
    if (labels.value[TENANT_KEY]) {
      state.tenant = tenantItems.value.findIndex((t) => {
        return t.TenantName === labels.value[TENANT_KEY];
      });
      if (state.tenant > -1) selectTenant();
      else delete labels.value[TENANT_KEY];
    }
  };

  watch(
    () => props.labels,
    (newValue) => {
      if (!newValue) return;
      labels.value = newValue;
      fillData();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const selectTenant = async (): Promise<void> => {
    if (state.tenant > -1) {
      state.width = 500;
      labels.value[TENANT_KEY] = tenantModel.value.TenantName;
      state.loading = true;
      projectItems.value = await useProjectListInTenant(new Tenant(tenantModel.value));
      state.loading = false;
      if (labels.value[PROJECT_KEY]) {
        state.project = projectItems.value.findIndex((t) => {
          return t.ProjectName === labels.value[PROJECT_KEY];
        });
        if (state.project > -1) selectProject();
        else delete labels.value[PROJECT_KEY];
      }
    } else {
      state.width = 250;
      delete labels.value[TENANT_KEY];
    }
  };

  const projectItems = ref<Project[]>([]);
  const projectModel: ComputedRef<Project> = computed(() => {
    return projectItems.value[state.project];
  });
  const selectProject = async (): Promise<void> => {
    if (state.project > -1) {
      state.width = 750;
      labels.value[PROJECT_KEY] = projectModel.value.ProjectName;
      state.loading = true;
      environmentItems.value = await useEnvironmentListInProject(new Project(projectModel.value));
      state.loading = false;
      if (labels.value[ENVIRONMENT_KEY]) {
        state.environment = environmentItems.value.findIndex((t) => {
          return t.EnvironmentName === labels.value[ENVIRONMENT_KEY];
        });
        if (!state.environment && state.environment !== 0) {
          delete labels.value[ENVIRONMENT_KEY];
        }
      }
    } else {
      state.width = 500;
      delete labels.value[PROJECT_KEY];
    }
  };

  const environmentItems = ref<Environment[]>([]);
  const environmentModel: ComputedRef<Environment> = computed(() => {
    return environmentItems.value[state.environment];
  });
  const emit = defineEmits(['setData']);
  const selectEnvironment = async (): Promise<void> => {
    if (state.environment > -1) {
      labels.value[ENVIRONMENT_KEY] = environmentModel.value.EnvironmentName;
      emit('setData', deepCopy(labels.value));
      state.menu = false;
    } else {
      delete labels.value[ENVIRONMENT_KEY];
    }
  };

  const search = (): void => {
    if (state.search) {
      environmentItems.value = environmentItems.value.filter((environment: Environment) => {
        return environment.EnvironmentName.indexOf(state.search) > -1;
      });
    } else {
      selectProject();
    }
  };

  const reset = (): void => {
    state.tenant = undefined;
    state.project = undefined;
    state.environment = undefined;
    tenantItems.value = [];
    projectItems.value = [];
    environmentItems.value = [];
    state.width = 250;
  };

  defineExpose({
    reset,
  });
</script>

<style lang="scss" scoped>
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
