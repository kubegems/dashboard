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
  <div class="d-inline-block">
    <v-menu v-for="(item, i) in items" :key="item.key" nudge-top="22px" open-on-hover top>
      <template #activator="{ on }">
        <v-btn
          :class="{ 'ml-2': i > 0, kubegems__text: !item.status }"
          :color="setColor(item.status)"
          depressed
          label
          :style="{ fontFamily: 'kubegems-sample' }"
          x-small
          v-on="on"
          @click="toPage(item)"
        >
          {{ item.name }}
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-2 text-caption">
          {{ item.status ? item.text : item.notext }}
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams } from '@kubegems/extension/router';
  import { ComputedRef, computed } from 'vue';

  import { useI18n } from '../../i18n';

  const i18nLocal = useI18n();
  const router = useRouter();
  const routeParams = useParams();

  const props = withDefaults(
    defineProps<{
      item?: any;
      l?: boolean;
      m?: boolean;
      s?: boolean;
    }>(),
    {
      item: undefined,
      l: false,
      m: false,
      s: false,
    },
  );

  const items: ComputedRef<any[]> = computed(() => {
    return [
      {
        key: 'm',
        name: 'Metrics',
        text: i18nLocal.t('tip.enabled_monitor'),
        notext: i18nLocal.t('tip.disabled_monitor'),
        status: props.m,
      },
      {
        key: 'l',
        name: 'Log',
        text: i18nLocal.t('tip.enabled_log'),
        notext: i18nLocal.t('tip.disabled_log'),
        status: props.l,
      },
      {
        key: 's',
        name: 'Mesh',
        text: i18nLocal.t('tip.enabled_mesh'),
        notext: i18nLocal.t('tip.disabled_mesh'),
        status: props.s,
      },
    ];
  });

  const setColor = (status: boolean): string => {
    return status ? 'primary' : '';
  };

  const toPage = (item: any): void => {
    if (item.key === 'm' && item.status) {
      router.push({
        name: 'observe-monitor-config',
        params: routeParams.value,
        query: {
          proj: props.item.projectName,
          env: props.item.environmentName,
          projid: props.item.projectID,
          envid: props.item.environmentID,
          cluster: props.item.clusterName,
          namespace: props.item.namespace,
          refresh: '1',
        },
      });
    } else if (item.key === 'l' && item.status) {
      router.push({
        name: 'log-config',
        params: routeParams.value,
        query: {
          proj: props.item.projectName,
          env: props.item.environmentName,
          projid: props.item.projectID,
          envid: props.item.environmentID,
          cluster: props.item.clusterName,
          namespace: props.item.namespace,
          refresh: '1',
        },
      });
    }
  };
</script>
