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
  <v-card flat>
    <v-card-title class="text-h6 primary--text">
      {{ item && item.metadata ? item.metadata.name : '' }}
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18n.t('resource.cluster') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ cluster }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="project" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18n.t('resource.project') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ projectName }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="environment" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18n.t('resource.environment') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ environmentName }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18n.t('resource.create_at') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { ENVIRONMENT_KEY, PROJECT_KEY } from '@kubegems/libs/constants/label';
  import moment from 'moment';
  import { ComputedRef, computed } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();
  const routeParams = useParams();

  const props = withDefaults(
    defineProps<{
      environment?: boolean;
      item?: any;
      project?: boolean;
    }>(),
    {
      environment: true,
      item: undefined,
      project: true,
    },
  );

  const cluster: ComputedRef<string> = computed(() => {
    return (
      store.state.Edge ||
      (store.state.AdminViewport
        ? store.getters.Cluster().ClusterName || ''
        : store.getters.Environment().ClusterName || '')
    );
  });

  const projectName: ComputedRef<string> = computed(() => {
    return props.item?.metadata?.labels?.[PROJECT_KEY] || routeParams.value?.project || '';
  });

  const environmentName: ComputedRef<string> = computed(() => {
    return props.item?.metadata?.labels?.[ENVIRONMENT_KEY] || routeParams.value?.environment || '';
  });
</script>
