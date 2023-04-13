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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateMonitorDashboardTemplate">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeMonitorTemplate">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ template ? template.name : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.description') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ template ? template.description : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.refresh') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ template ? template.refresh : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.graph_count') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ template && template.graphs ? template.graphs.length : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :template="template" />
      </v-col>
    </v-row>

    <MonitorTemplateForm ref="monitorTemplate" @refresh="getMonitorTemplate" />
  </v-container>
</template>

<script lang="ts" setup>
  import { MonitorTemplate } from '@kubegems/api/typed/monitor_template';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, ref } from 'vue';

  import MonitorTemplateForm from './components/MonitorTemplateForm.vue';
  import ResourceInfo from './components/ResourceInfo.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();

  const tab = ref<number>(0);
  const tabItems = [{ text: i18nLocal.t('tab.template_info'), value: ResourceInfo }];

  const template = ref<MonitorTemplate>(undefined);
  const getMonitorTemplate = async (): Promise<void> => {
    const data = await new MonitorTemplate({ name: routeParams.value.name }).getMonitorTemplate();
    template.value = data;
  };

  onMounted(() => {
    getMonitorTemplate();
  });

  const removeMonitorTemplate = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.monitor_template')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.monitor_template')])} ${template.value.name}`,
        type: 'delete',
        name: template.value.name,
      },
      doFunc: async () => {
        await new MonitorTemplate(template.value).deleteMonitorTemplate();
        router.push({ name: 'monitor-template-list', params: routeParams.value });
      },
    });
  };

  const monitorTemplate = ref(null);
  const updateMonitorDashboardTemplate = (): void => {
    monitorTemplate.value.init(template.value);
    monitorTemplate.value.open();
  };
</script>
