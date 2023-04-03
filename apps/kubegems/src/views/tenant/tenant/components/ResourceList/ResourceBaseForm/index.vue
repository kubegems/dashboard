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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle
      :title="
        cluster ? `${i18n.t('resource.cluster')} ${cluster}` : i18n.t('form.definition', [i18n.t('resource.cluster')])
      "
    />
    <v-card-text class="pa-2">
      <v-row v-if="!edit">
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.ClusterID"
            class="my-0"
            color="primary"
            hide-selected
            item-text="ClusterName"
            item-value="ID"
            :items="clusterItems"
            :label="i18n.t('resource.cluster')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRule.cluster"
            @change="onClusterChange"
            @focus="getClusterItems"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['ClusterName'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <ResourceChart :nvidia="nvidia" :quota="quota" :tke="tke" />

      <BaseSubTitle :title="i18nLocal.t('resource.tip.resource_limit')" />
      <v-card-text class="px-0 pb-2">
        <v-row class="mx-0">
          <v-col class="px-0 py-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.cpu')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }} core
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.cpu']"
                class="my-0"
                :label="
                  edit
                    ? `${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.cpu')])}`
                    : `${i18nLocal.t('resource.tip.limit', [i18n.t('resource.cpu')])}`
                "
                required
                :rules="objRule.cpu"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> core </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
          <v-col class="pa-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.memory')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }} Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.memory']"
                class="my-0"
                :label="
                  edit
                    ? `${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.memory')])}`
                    : `${i18nLocal.t('resource.tip.limit', [i18n.t('resource.memory')])}`
                "
                required
                :rules="objRule.memory"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> Gi </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
          <v-col class="px-0 py-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.storage')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }}
                  Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content[`limits.storage`]"
                class="my-0"
                :label="
                  edit
                    ? `${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.storage')])}`
                    : `${i18nLocal.t('resource.tip.limit', [i18n.t('resource.storage')])}`
                "
                required
                :rules="objRule.storage"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> Gi </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-switch
        v-if="nvidia || tke"
        v-model="state.canSetGpu"
        class="mx-2"
        dense
        hide-details
        :label="i18nLocal.t('resource.tip.gpu_resource_limit')"
      />

      <template v-if="state.canSetGpu">
        <BaseSubTitle :title="i18nLocal.t('resource.tip.gpu_resource_limit')" />
        <v-card-text class="px-0 pb-2">
          <v-row class="mx-0">
            <v-col v-if="nvidia" class="px-0 py-0" cols="4">
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  nvidia {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.gpu')]) }}
                  <div class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedNvidiaGpu.toFixed(1) : 0 }} Gpu
                  </div>
                </v-flex>
                <v-text-field
                  v-model="obj.Content['limits.nvidia.com/gpu']"
                  class="my-0"
                  :label="
                    edit
                      ? `nvidia ${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.gpu')])}`
                      : `nvidia ${i18nLocal.t('resource.tip.limit', [i18n.t('resource.gpu')])}`
                  "
                  required
                  :rules="objRule.nvidia"
                  type="number"
                >
                  <template #append>
                    <span class="text-body-2 kubegems__text">
                      {{ i18nLocal.t('resource.tip.limit', [i18n.t('resource.gpu')]) }}
                    </span>
                  </template>
                </v-text-field>
              </v-sheet>
            </v-col>
            <template v-if="tke">
              <v-col class="pa-0" cols="4">
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    tke {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.gpu')]) }}
                    <div class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeGpu.toFixed(1) : 0 }} {{ i18nLocal.t('resource.form.unit') }} (1{{
                        i18nLocal.t('resource.form.unit')
                      }}=0.01 Gpu)
                    </div>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content['limits.tencent.com/vcuda-core']"
                    class="my-0"
                    :label="
                      edit
                        ? `tke ${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.gpu')])}`
                        : `tke ${i18nLocal.t('resource.tip.limit', [i18n.t('resource.gpu')])}`
                    "
                    required
                    :rules="objRule.tkeVcuda"
                    type="number"
                  >
                    <template #append>
                      <span class="text-body-2 kubegems__text">
                        {{ parseInt(obj.Content['limits.tencent.com/vcuda-core'] || 0) / 100 }} Gpu
                      </span>
                    </template>
                  </v-text-field>
                </v-sheet>
              </v-col>
              <v-col class="px-0 py-0" cols="4">
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    tke {{ i18nLocal.t('resource.form.apply', [i18n.t('resource.video_memory')]) }}
                    <div class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeMemory.toFixed(1) : 0 }} {{ i18nLocal.t('resource.form.unit') }} (1{{
                        i18nLocal.t('resource.form.unit')
                      }}=256Mi)
                    </div>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content[`limits.tencent.com/vcuda-memory`]"
                    class="my-0"
                    :label="
                      edit
                        ? `tke ${i18nLocal.t('resource.tip.scale_limit', [i18n.t('resource.video_memory')])}`
                        : `tke ${i18nLocal.t('resource.tip.limit', [i18n.t('resource.video_memory')])}`
                    "
                    required
                    :rules="objRule.tkeVcudaMemory"
                    type="number"
                  >
                    <template #append>
                      <span class="text-body-2 kubegems__text">
                        {{ (parseInt(obj.Content['limits.tencent.com/vcuda-memory'] || 0) * 256) / 1024 }}Gi
                      </span>
                    </template>
                  </v-text-field>
                </v-sheet>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
      </template>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { integer, required } from '@kubegems/libs/utils/rules';
  import { ComputedRef, computed, reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import ResourceChart from './ResourceChart.vue';
  import { useClusterList } from '@/composition/cluster';
  import { Cluster } from '@/types/cluster';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      edit?: boolean;
      cluster?: string;
      quota?: any;
    }>(),
    {
      edit: false,
      cluster: '',
      quota: undefined,
    },
  );

  const state = reactive({
    valid: false,
    canSetGpu: false,
  });

  const obj = ref({
    ClusterID: null,
    TenantID: null,
    Content: {
      'limits.cpu': '',
      'limits.memory': '',
      'limits.storage': '',
    },
  });
  const objRule: ComputedRef<any> = computed(() => {
    return {
      cluster: [required],
      cpu: [
        required,
        integer,
        (v) => parseInt(v) <= (props.quota ? props.quota.AllocatedCpu : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
      memory: [
        required,
        integer,
        (v) =>
          parseInt(v) <= (props.quota ? props.quota.AllocatedMemory : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
      storage: [
        required,
        integer,
        (v) =>
          parseInt(v) <= (props.quota ? props.quota.AllocatedStorage : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
      nvidia: [
        required,
        integer,
        (v) =>
          parseInt(v) <= (props.quota ? props.quota.AllocatedNvidiaGpu : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
      tkeVcuda: [
        required,
        integer,
        (v) =>
          parseInt(v) <= (props.quota ? props.quota.AllocatedTkeGpu : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
      tkeVcudaMemory: [
        required,
        integer,
        (v) =>
          parseInt(v) <= (props.quota ? props.quota.AllocatedTkeMemory : 0) || i18nLocal.t('resource.form.limit_rule'),
      ],
    };
  });

  const nvidia: ComputedRef<boolean> = computed(() => {
    if (props.quota) {
      return Object.prototype.hasOwnProperty.call(props.quota, 'NvidiaGpu');
    }
    return false;
  });
  const tke: ComputedRef<boolean> = computed(() => {
    if (props.quota) {
      return (
        Object.prototype.hasOwnProperty.call(props.quota, 'TkeGpu') ||
        Object.prototype.hasOwnProperty.call(props.quota, 'TkeMemory')
      );
    }
    return false;
  });

  const form = ref(null);
  const validate = (): void => {
    return form.value.validate(true);
  };

  const getData = (): any => {
    const data = deepCopy(obj.value);
    if (!state.canSetGpu) {
      if (nvidia) {
        delete data.Content['limits.nvidia.com/gpu'];
      }
      if (tke) {
        delete data.Content['limits.tencent.com/vcuda-core'];
        delete data.Content['limits.tencent.com/vcuda-memory'];
      }
    }
    return data;
  };

  const setContent = (data: any): void => {
    obj.value.Content = deepCopy(data);
  };

  const reset = (): void => {
    form.value.reset();
  };

  const clusterItems = ref<Cluster[]>([]);
  const getClusterItems = async (): Promise<void> => {
    clusterItems.value = await useClusterList(new Cluster());
  };

  const emit = defineEmits(['clusterChanged']);
  const onClusterChange = () => {
    emit('clusterChanged', obj.value.ClusterID);
  };

  defineExpose({
    validate,
    getData,
    setContent,
    reset,
  });
</script>
