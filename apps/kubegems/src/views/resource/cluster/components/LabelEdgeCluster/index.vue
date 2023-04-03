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
    :title="i18nLocal.t('operate.label_c', [i18n.t('resource.edge_cluster')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form lazy-validation @submit.prevent>
        <v-flex :class="state.expand ? 'kubegems__overlay' : ''" />
        <BaseSubTitle
          :title="
            i18n.t('operate.allocate_c', [
              `${i18n.t('resource.tenant')}${i18n.t('resource.project')}${i18n.t('resource.environment')}`,
            ])
          "
        />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <TenantProjEnvSelectCascade ref="cascade" :labels="labels" @setData="setData" />
            </v-col>
          </v-row>
        </v-card-text>

        <LabelForm
          ref="label"
          class="kubegems__forminform"
          :data="otherLables"
          @addData="addLabelData"
          @closeOverlay="close"
        />
        <BaseSubTitle :title="i18nLocal.t('tip.label')" />
        <v-card-text class="pa-2">
          <LabelItem
            :labels="otherLables"
            @expandCard="expand"
            @removeLabels="removeLabels"
            @updateLabels="updateLabels"
          />
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-form>

      <div :style="{ height: 'auto' }" />
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { EDGE_DEVICEID_KEY, ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@kubegems/libs/constants/label';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import TenantProjEnvSelectCascade from './TenantProjEnvSelectCascade.vue';
  import { EdgeCluster } from '@/types/edge_cluster';
  import LabelForm from '@/views/resource/components/label/LabelForm.vue';
  import LabelItem from '@/views/resource/components/label/LabelItem.vue';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    dialog: false,
    expand: false,
  });

  const open = () => {
    state.dialog = true;
  };

  const labels = ref({});
  const otherLables = ref({});
  const edgeCluster = ref<EdgeCluster>(new EdgeCluster());
  const init = (item: EdgeCluster) => {
    edgeCluster.value = item;
    labels.value = getLabel();
    otherLables.value = getLabel(false);
  };

  const getLabel = (isEnv = true): { [key: string]: any } => {
    const newLabel = {};
    if (edgeCluster.value.metadata.labels) {
      let keys: string[];
      if (isEnv) {
        keys = Object.keys(edgeCluster.value.metadata.labels).filter((l) => {
          return [ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY].indexOf(l) > -1;
        });
      } else {
        keys = Object.keys(edgeCluster.value.metadata.labels).filter((l) => {
          return [ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY, EDGE_DEVICEID_KEY].indexOf(l) === -1;
        });
      }
      keys.forEach((key) => {
        newLabel[key] = edgeCluster.value.metadata.labels[key];
      });
    }
    return newLabel;
  };

  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    edgeCluster.value.metadata.labels = {
      ...otherLables.value,
      ...labels.value,
      [EDGE_DEVICEID_KEY]: edgeCluster.value.metadata.labels[EDGE_DEVICEID_KEY],
    };
    await new EdgeCluster(edgeCluster.value).updateEdgeCluster();
    reset();
    emit('refresh');
  };

  const setData = (data: { [key: string]: string | number | boolean }): void => {
    labels.value = data;
  };

  const cascade = ref(null);
  const reset = () => {
    state.dialog = false;
    labels.value = {};
    otherLables.value = {};
    cascade.value.reset();
  };

  const label = ref(null);
  const addLabelData = (data) => {
    otherLables.value = data;
  };

  const removeLabels = (key: string): void => {
    const data: { [key: string]: string } = {};
    Object.keys(otherLables.value).forEach((k: string) => {
      if (k !== key) {
        data[k] = otherLables.value[k];
      }
    });
    otherLables.value = data;
  };

  const updateLabels = (key: string): void => {
    const data: { [key: string]: string } = { key: key, value: otherLables.value[key] };
    label.value.init(data);
    state.expand = true;
  };

  const expand = (): void => {
    label.value.expand = true;
    state.expand = true;
  };

  const close = (): void => {
    state.expand = false;
  };

  defineExpose({
    open,
    init,
  });
</script>
