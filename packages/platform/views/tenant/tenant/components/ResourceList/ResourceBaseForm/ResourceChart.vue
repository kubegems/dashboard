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
  <div>
    <v-row>
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :extend-height="180"
          :metrics="cpuSeries"
          :theme-conifg="config.theme"
          :title="i18n.t('resource.cpu')"
          :total="quota ? quota.Cpu : 0"
          unit="core"
          :val="quota ? quota.UsedCpu : 0"
        />
      </v-col>
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :extend-height="180"
          :metrics="memorySeries"
          :theme-conifg="config.theme"
          :title="i18n.t('resource.memory')"
          :total="quota ? quota.Memory : 0"
          unit="Gi"
          :val="quota ? quota.UsedMemory : 0"
        />
      </v-col>
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :extend-height="180"
          :metrics="storageSeries"
          :theme-conifg="config.theme"
          :title="i18n.t('resource.storage')"
          :total="quota ? quota.Storage : 0"
          unit="Gi"
          :val="quota ? quota.UsedStorage : 0"
        />
      </v-col>
    </v-row>

    <v-expand-transition>
      <v-row>
        <v-col v-if="nvidia && state.showMore" class="py-0" cols="4">
          <BaseRadialBarChart
            class="my-3"
            :extend-height="180"
            :metrics="nvidiaSeries"
            :theme-conifg="config.theme"
            :title="`Nvidia ${i18n.t('resource.gpu')}`"
            :total="quota ? quota.NvidiaGpu : 0"
            unit="gpu"
            :val="quota ? quota.UsedNvidiaGpu : 0"
          />
        </v-col>

        <template v-if="tke && state.showMore">
          <v-col class="py-0" cols="4">
            <BaseRadialBarChart
              class="my-3"
              :extend-height="180"
              :metrics="tkeSeries"
              :theme-conifg="config.theme"
              :title="`Tke ${i18n.t('resource.gpu')}`"
              :total="quota ? quota.TkeGpu : 0"
              unit=""
              :val="quota ? quota.UsedTkeGpu : 0"
            />
          </v-col>
          <v-col class="py-0" cols="4">
            <BaseRadialBarChart
              class="my-3"
              :extend-height="180"
              :metrics="tkeMemorySeries"
              :theme-conifg="config.theme"
              :title="`Tke ${i18n.t('resource.video_memory')}`"
              :total="quota ? quota.TkeMemory : 0"
              unit=""
              :val="quota ? quota.UsedTkeMemory : 0"
            />
          </v-col>
        </template>
      </v-row>
    </v-expand-transition>

    <div v-if="tke || nvidia" class="text-center mt-3">
      <v-btn color="primary" small text @click="state.showMore = !state.showMore">
        {{ state.showMore ? `${i18n.t('tip.hide')} GPU` : `${i18n.t('tip.show')} GPU` }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { ComputedRef, computed, reactive } from 'vue';

  import config from '../../../../../../config.json';

  const i18n = useGlobalI18n();

  const props = withDefaults(
    defineProps<{
      nvidia?: boolean;
      tke?: boolean;
      quota?: any;
    }>(),
    {
      nvidia: false,
      tke: false,
      quota: undefined,
    },
  );

  const state = reactive({
    showMore: false,
  });

  const cpuSeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedCpu === 0
        ? [[0, 100]]
        : [[(props.quota.UsedCpu / props.quota.Cpu) * 100, 100 - (props.quota.UsedCpu / props.quota.Cpu) * 100]]
      : [[0, 100]];
  });

  const memorySeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedMemory === 0
        ? [[0, 100]]
        : [
            [
              (props.quota.UsedMemory / props.quota.Memory) * 100,
              100 - (props.quota.UsedMemory / props.quota.Memory) * 100,
            ],
          ]
      : [[0, 100]];
  });

  const storageSeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedStorage === 0
        ? [[0, 100]]
        : [
            [
              (props.quota.UsedStorage / props.quota.Storage) * 100,
              100 - (props.quota.UsedStorage / props.quota.Storage) * 100,
            ],
          ]
      : [[0, 100]];
  });

  const nvidiaSeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedNvidiaGpu === 0
        ? [[0, 100]]
        : [
            [
              (props.quota.UsedNvidiaGpu / props.quota.NvidiaGpu) * 100,
              100 - (props.quota.UsedNvidiaGpu / props.quota.NvidiaGpu) * 100,
            ],
          ]
      : [[0, 100]];
  });

  const tkeSeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedTkeGpu === 0
        ? [[0, 100]]
        : [
            [
              (props.quota.UsedTkeGpu / props.quota.TkeGpu) * 100,
              100 - (props.quota.UsedTkeGpu / props.quota.TkeGpu) * 100,
            ],
          ]
      : [[0, 100]];
  });

  const tkeMemorySeries: ComputedRef<any> = computed(() => {
    return props.quota
      ? props.quota.UsedTkeMemory === 0
        ? [[0, 100]]
        : [
            [
              (props.quota.UsedTkeMemory / props.quota.TkeMemory) * 100,
              100 - (props.quota.UsedTkeMemory / props.quota.TkeMemory) * 100,
            ],
          ]
      : [[0, 100]];
  });
</script>
