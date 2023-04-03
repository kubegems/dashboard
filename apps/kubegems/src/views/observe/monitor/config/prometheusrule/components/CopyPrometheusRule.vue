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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-content-copy"
    :title="i18nLocal.t('operate.copy_c', [i18n.t('resource.prometheus_rule')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-autocomplete
          v-model="obj.namespace"
          class="my-0"
          color="primary"
          hide-selected
          item-text="EnvironmentName"
          item-value="Namespace"
          :items="environmentItems"
          :label="i18n.t('resource.environment')"
          :no-data-text="i18n.t('data.no_data')"
          :rules="objRule.envRules"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['Namespace'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-form>
      <div>{{ i18nLocal.t('tip.need_copy') }}</div>
      <div v-for="(rule, index) in rules" :key="index">{{ rule.name }}</div>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="copyPrometheusRule">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useEnvironmentListInProject } from '@kubegems/api/hooks/project';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Project } from '@kubegems/api/typed/project';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { nextTick, onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import { PrometheusRule } from '@/types/prometheus_rule';

  const props = withDefaults(
    defineProps<{
      rules?: PrometheusRule[];
    }>(),
    {
      rules: undefined,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();
  const query = useQuery();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  let environmentItems = ref<Environment[]>([]);
  onMounted(() => {
    nextTick(async () => {
      if (query.value.projid && query.value.proj) {
        environmentItems.value = await useEnvironmentListInProject(
          new Project({ ID: query.value.projid, ProjectName: query.value.proj }),
        );
      }
    });
  });

  const obj = reactive({ namespace: '' });
  const objRule = reactive({ envRules: [required] });

  const open = (): void => {
    state.dialog = true;
  };

  const form = ref(null);
  const copyPrometheusRule = () => {
    props.rules.forEach(async (item: PrometheusRule) => {
      item.namespace = obj.namespace;
      item.id = null;
      item.receivers.forEach((receive) => {
        receive.id = null;
      });
      await new PrometheusRule(item).addPrometheusRule();
    });
    reset();
  };

  const reset = () => {
    form.value.reset();
    state.dialog = false;
  };

  defineExpose({
    open,
  });
</script>
