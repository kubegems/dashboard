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
    icon="mdi-label-variant"
    :title="i18n.t('operate.allocate_c', [i18n.t('resource.edge_cluster')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <div :style="{ height: 'auto' }">
        <TenantProjEnvSelectCascade :labels="labels" @setData="setData" />
      </div>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import TenantProjEnvSelectCascade from './TenantProjEnvSelectCascade.vue';
  import { ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@/constants/label';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { EdgeCluster } from '@/types/edge_cluster';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    dialog: false,
  });

  const open = () => {
    state.dialog = true;
  };

  const labels = ref({});
  const edgeCluster = ref<EdgeCluster>(new EdgeCluster());
  const init = (item: EdgeCluster) => {
    edgeCluster.value = item;
    labels.value = edgeCluster.value.metadata.labels || {};
  };

  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (labels.value[TENANT_KEY] && labels.value[PROJECT_KEY] && labels.value[ENVIRONMENT_KEY]) {
      edgeCluster.value.metadata.labels = labels.value;
      await new EdgeCluster(edgeCluster.value).updateEdgeCluster();
      reset();
      emit('refresh');
    } else {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.select_environment'),
        color: 'warning',
      });
    }
  };

  const setData = (data: { [key: string]: string | number | boolean }): void => {
    labels.value = data;
  };

  const reset = () => {
    state.dialog = false;
    labels.value = {};
  };

  defineExpose({
    open,
    init,
  });
</script>
