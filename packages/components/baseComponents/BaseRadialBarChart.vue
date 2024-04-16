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
    <canvas :id="chartId" @mouseout="clear" />
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { randomString } from '@kubegems/libs/utils/helpers';
  import Chart from 'chart.js/auto';
  import DoughnutLabel from 'chartjs-plugin-doughnutlabel-v3';
  import { nextTick, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      extendHeight?: number;
      labels?: string[];
      metrics?: any[];
      title?: string;
      cutout?: number;
      defaultVal?: number;
      tooltipExternal?: boolean;
      total?: number;
      unit?: string;
      val?: number;
      themeConifg?: any;
    }>(),
    {
      id: '',
      extendHeight: 150,
      labels: undefined,
      metrics: undefined,
      title: '',
      cutout: 80,
      defaultVal: 0,
      tooltipExternal: false,
      total: 0,
      unit: '',
      val: 0,
      themeConifg: undefined,
    },
  );

  const store = useStore();

  const chart = ref<any>(undefined);
  const chartId = ref<string>('');
  const triggerVal = ref<number>(0);

  const loadChart = (): void => {
    if (!chart.value) {
      const ctx = (document.getElementById(chartId.value) as HTMLCanvasElement).getContext('2d');
      chart.value = new Chart(
        ctx as any,
        {
          plugins: [DoughnutLabel],
          type: 'doughnut',
          data: {
            labels: props.labels,
            datasets: loadDatasets(),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              doughnutLabel: {
                labels: [
                  {
                    text: props.title,
                    color: store.state.ThemeColor || props.themeConifg.THEME_COLOR.primary,
                    font: {
                      size: 16,
                      weight: 'bold',
                    },
                  },
                  {
                    text: formatter,
                    color: 'black',
                    font: {
                      size: 13,
                      lineHeight: 1.5,
                    },
                  },
                ],
              },
              legend: {
                display: false,
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyleWidth: 10,
                  boxHeight: 7,
                },
              },
              tooltip: {
                enabled: false,
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                external: props.tooltipExternal
                  ? (context) => {
                      const { tooltip } = context;
                      if (tooltip.dataPoints?.length > 0) {
                        if (tooltip.dataPoints[0].dataset.data?.length > 0) {
                          triggerVal.value = ((tooltip.dataPoints[0].dataset.data[0] as number) / 100) * props.total;
                        }
                      }
                    }
                  : null,
              },
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
    const datasets = props?.metrics.map((m, index) => {
      return {
        data: m,
        backgroundColor: [
          [
            store.state.ThemeColor || props.themeConifg.THEME_COLOR.primary,
            props.themeConifg.THEME_COLOR.success,
            props.themeConifg.THEME_COLOR_EXTEND.warning,
          ][index % 3],
          '#f4f4f4',
        ],
        cutout: `${props.cutout}%`,
      };
    });

    return datasets;
  };

  const formatter = (): string => {
    if (props.defaultVal && triggerVal.value === 0) {
      return `${props.defaultVal.toFixed(1)} ${props.unit}`;
    }

    let tl: number | string = parseFloat(props.total.toString()).toFixed(1);
    if (parseInt(tl) === parseFloat(tl)) {
      tl = parseInt(tl);
    }

    if (props.val) {
      if (props.val === 0) {
        return `0 / ${tl} ${props.unit}`;
      }
    } else {
      if (triggerVal.value === 0) {
        return `0 / ${tl} ${props.unit}`;
      }
    }

    let used: number | string = props.val ? parseFloat(props.val.toString()).toFixed(2) : triggerVal.value.toFixed(2);
    if (parseInt(used) === parseFloat(used)) {
      used = parseInt(used);
    }

    return `${used} / ${tl} ${props.unit}`;
  };

  const clear = (): void => {
    triggerVal.value = 0;
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

  watch(
    () => store.state.ThemeColor,
    async (newValue) => {
      if (newValue && newValue?.length >= 0 && document.getElementById(chartId.value)) {
        loadChart();
      }
    },
    { deep: true },
  );
</script>
