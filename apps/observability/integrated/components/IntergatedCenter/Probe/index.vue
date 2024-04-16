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
  <div class="pa-3">
    <BaseSubTitle class="my-0" color="grey lighten-3" :divider="false" :title="i18nLocal.t('tip.probe_config')" />

    <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="probe" />
      <v-row class="mt-0 px-2">
        <v-col cols="6">
          <v-text-field
            v-model="probe.metadata.name"
            class="my-0"
            :label="i18nLocal.t('tip.task_name')"
            required
            :rules="objRule.nameRules"
          />
        </v-col>

        <v-col cols="6">
          <v-autocomplete
            v-model="probe.spec.interval"
            class="my-0"
            color="primary"
            :items="intervalItems"
            :label="i18nLocal.t('tip.interval')"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRule.intervalRules"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <BaseSubTitle
        class="my-0"
        color="grey lighten-3"
        :divider="false"
        :title="i18nLocal.t('tip.probe_type_config')"
      />

      <v-tabs v-model="tab" class="rounded-t mt-4" height="30" @change="typeChanged">
        <v-tab v-for="item in tabItems" :key="item.text">
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <component :is="tabItems[tab].value" :probe="probe" />
    </v-form>
  </div>
</template>

<script lang="ts" setup>
  import { PrometheusProbe } from '@kubegems/api/typed/prometheus_probe';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import ProjectEnvSelect from '../ProjectEnvSelect.vue';
  import Http from './Http.vue';
  import Icmp from './Icmp.vue';
  import Tcp from './Tcp.vue';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const env = ref(undefined);
  const state = reactive({
    valid: false,
  });

  const probe = ref<PrometheusProbe>(new PrometheusProbe());
  const objRule = reactive({
    nameRules: [required],
    intervalRules: [required],
  });

  const intervalItems = [
    { text: i18nLocal.t('tip.1_min'), value: '1m' },
    { text: i18nLocal.t('tip.5_min'), value: '5m' },
    { text: i18nLocal.t('tip.10_min'), value: '10m' },
    { text: i18nLocal.t('tip.30_min'), value: '30m' },
    { text: i18nLocal.t('tip.1_hour'), value: '1h' },
    { text: i18nLocal.t('tip.2_hour'), value: '2h' },
    { text: i18nLocal.t('tip.6_hour'), value: '6h' },
    { text: i18nLocal.t('tip.12_hour'), value: '12h' },
  ];

  const tab = ref(0);
  const tabItems = [
    { text: 'ICMP', value: Icmp, module: 'ping' },
    { text: 'TCP', value: Tcp, module: 'tcp_connect' },
    { text: 'HTTP', value: Http, module: 'http_2xx' },
  ];
  const typeChanged = (): void => {
    probe.value.spec.module = tabItems[tab.value].module;
  };

  const emit = defineEmits(['close']);
  const form = ref(null);
  const addData = async (): Promise<void> => {
    if (form.value.validate(true)) {
      if (env.value.clusterName && env.value.namespace) {
        probe.value.metadata.namespace = env.value.namespace;
        probe.value.spec.prober.url = 'prometheus-blackbox-exporter.kubegems-monitoring.svc.cluster.local:9115';
        await probe.value.addPrometheusProbe(env.value.clusterName);
        emit('close');
      } else {
        store.commit('SET_SNACKBAR', {
          text: i18n.t('tip.select_project_environment'),
          color: 'warning',
        });
        return;
      }
    }
  };

  defineExpose({
    addData,
  });
</script>
