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
        {{ i18n.t('resource.project') }}
        <v-menu
          v-model="state.menu"
          bottom
          content-class="tenant-header__bg"
          max-height="310px"
          max-width="400px"
          min-width="120px"
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
              @click.stop="getProject"
            >
              <v-icon left>mdi-view-dashboard</v-icon>
              {{ store.getters.Project().ProjectName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: i18n.t('resource.project'), values: projectItems }]">
            <template #no-data>
              <v-card>
                <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat :loading="state.loading">
                <v-list class="pb-3" dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ i18n.t('resource.project') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <div class="header__list px-2">
                    <v-list-item
                      v-for="(project, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="{
                        color:
                          project.ProjectName === store.getters.Project().ProjectName
                            ? `var(--primary-color) !important`
                            : ``,
                      }"
                      @click="setProject(project)"
                    >
                      <v-list-item-content class="text-body-2 font-weight-medium text-start">
                        <div class="kubegems__break-all">
                          <v-icon color="primary" left small>mdi-view-dashboard</v-icon>
                          {{ project.ProjectName }}
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
        {{ i18n.t('resource.project') }}
        <v-btn
          class="primary--text text-subtitle-1 font-weight-medium mt-n1"
          color="white"
          dark
          depressed
          small
          @click.stop
        >
          <v-icon left>mdi-view-dashboard</v-icon>
          {{ store.getters.Project().ProjectName }}
          <v-icon right @click.stop="toProject"> mdi-open-in-new </v-icon>
        </v-btn>
      </v-sheet>

      <v-spacer />

      <v-sheet>
        <span class="text-body-2 kubegems__text">
          {{ i18n.t('resource.project_c', [i18n.t('resource.role')]) }}:
          {{ PROJECT_ROLE[useProjectRole()] ? i18n.t(`role.project.${useEnvironmentRole()}`) : i18n.t('data.unknown') }}
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { useProjectList } from '@kubegems/api/hooks/project';
  import { Project } from '@kubegems/api/typed/project';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useEnvironmentRole, useProjectRole } from '@kubegems/extension/permission';
  import { useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { PROJECT_ROLE } from '@kubegems/libs/constants/platform';
  import { inject, reactive, ref } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();

  withDefaults(
    defineProps<{
      selectable?: boolean;
    }>(),
    {
      selectable: true,
    },
  );

  const state = reactive({
    menu: false,
    loading: false,
  });

  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload') as reloadHandler;
  const setProject = async (item: Project): Promise<void> => {
    await router.replace({
      params: {
        tenant: store.getters.Tenant().TenantName,
        project: item.ProjectName,
      },
    });
    reload();
  };

  const toProject = (): void => {
    store.commit('CLEAR_RESOURCEIRONMENT');
    router.push({
      name: 'project-detail',
      params: {
        name: store.getters.Project().ProjectName,
        tenant: store.getters.Tenant().TenantName,
        project: store.getters.Project().ProjectName,
      },
    });
  };

  const projectItems = ref<Project[]>([]);
  const getProject = async (): Promise<void> => {
    state.loading = true;
    const data = await useProjectList(new Project());
    projectItems.value = data;
    state.loading = false;
  };
</script>

<style lang="scss" scoped>
  .tenant-header__bg {
    z-index: auto !important;
  }

  .header {
    &__list {
      max-height: 250px;
      overflow-y: auto;
    }
  }
</style>
