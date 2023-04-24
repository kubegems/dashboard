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
  <div :style="{ height: `${extendHeight}px`, position: 'relative', width: '100%' }">
    <canvas :id="chartId" />
  </div>
</template>

<script lang="ts" setup>
  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@kubegems/libs/constants/chart';
  import { randomString } from '@kubegems/libs/utils/helpers';
  import Chart from 'chart.js/auto';
  import { nextTick, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      color?: string[];
      colorful?: boolean;
      extendHeight?: number;
      labels?: string[];
      metrics?: any[];
      title?: string;
    }>(),
    {
      id: '',
      color: undefined,
      colorful: false,
      extendHeight: 280,
      labels: undefined,
      metrics: undefined,
      title: '',
    },
  );

  const chart = ref<any>(undefined);
  const chartId = ref<string>('');

  const loadChart = (): void => {
    if (!chart.value) {
      const ctx = (document.getElementById(chartId.value) as HTMLCanvasElement).getContext('2d');
      chart.value = new Chart(
        ctx as any,
        {
          type: 'pie',
          data: {
            labels: props.labels,
            datasets: loadDatasets(),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                align: 'start',
                display: true,
                text: props.title,
              },
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyleWidth: 10,
                  boxHeight: 7,
                },
              },
              tooltip: {
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                mode: 'index',
              },
            },
            interaction: {
              intersect: false,
              mode: 'index',
            },
          },
        } as any,
      );
    } else {
      chart.value.data = { datasets: loadDatasets() };
      chart.value.update('none');
    }
  };

  const loadDatasets = (): any[] => {
    const datasets = [
      {
        data: props.metrics,
        backgroundColor:
          props.color?.length > 0
            ? props.color
            : props.colorful
            ? LINE_THEME_FUL_COLORS
            : LINE_THEME_COLORS.map((item) => {
                return getComputedStyle(document.documentElement)
                  .getPropertyValue(item.replaceAll('var(', '').replaceAll(')', ''))
                  ?.trim();
              }),
        hoverOffset: 4,
      },
    ];
    return datasets;
  };

  onMounted(() => {
    nextTick(() => {
      if (props.id) {
        chartId.value = props.id;
      } else {
        chartId.value = randomString(6);
      }
      const interval = setInterval(() => {
        if (document.getElementById(chartId.value)) {
          clearInterval(interval);
          loadChart();
        }
      }, 300);
    });
  });

  watch(
    () => props.metrics,
    async (newValue) => {
      if (newValue && newValue?.length >= 0 && document.getElementById(chartId.value)) {
        loadChart();
      }
    },
    { deep: true },
  );
</script>
