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
  <div :style="{ height: `${autoGrow ? height : extendHeight}px`, position: 'relative', width: '100%' }">
    <canvas :id="chartId" />
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@kubegems/libs/constants/chart';
  import { randomString } from '@kubegems/libs/utils/helpers';
  import Chart, { ScatterDataPoint } from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import moment from 'moment';
  import { nextTick, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      color?: string[];
      colorful?: boolean;
      extendHeight?: number;
      labels?: string[];
      labelShow?: boolean;
      metrics?: any[];
      title?: string;
      autoGrow?: boolean;
      duration?: number;
      xDisplay?: boolean;
      yDisplay?: boolean;
    }>(),
    {
      id: '',
      color: undefined,
      colorful: false,
      extendHeight: 280,
      labels: undefined,
      labelShow: true,
      metrics: undefined,
      title: '',
      autoGrow: true,
      duration: 0,
      xDisplay: true,
      yDisplay: true,
    },
  );

  const store = useStore();
  const chart = ref<any>(undefined);
  const chartId = ref<string>('');
  const height = ref<number>(100);

  const loadChart = (): void => {
    if (!chart.value) {
      const ctx = (document.getElementById(chartId.value) as HTMLCanvasElement).getContext('2d');
      chart.value = new Chart(
        ctx as any,
        {
          type: 'bar',
          plugins: [ChartDataLabels],
          data: {
            labels: props.labels,
            datasets: loadDatasets(),
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                align: 'start',
                display: true,
                text: props.title,
              },
              legend: {
                display: props.labelShow,
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
                callbacks: {
                  label: (tooltipItem) => {
                    return `${moment((tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x[0]).format(
                      'HH:mm:ss.SSS',
                    )} duration: ${(
                      (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x[1] -
                      (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x[0]
                    ).toFixed(3)} ms`;
                  },
                },
              },
              datalabels: {
                color: '#424242',
                anchor: 'start',
                align: (context) => {
                  return ((context.dataset.data[context.dataIndex] as ScatterDataPoint).x[0] -
                    (context.dataset.data[0] as ScatterDataPoint).x[0]) /
                    props.duration <
                    0.2
                    ? 'right'
                    : 'left';
                },
                display: (context) => {
                  return context.dataset.data[context.dataIndex] !== null ? 'auto' : false;
                },
                formatter: (value) => {
                  return value.operation;
                },
              },
            },
            radius: 0,
            borderWidth: 1,
            scales: {
              xAxis: {
                display: props.xDisplay,
                min: props.metrics?.length > 0 ? props.metrics[0]?.data[0]?.x[0] : 0,
                grid: {
                  display: false,
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10,
                  source: 'data',
                },
                beginAtZero: false,
                type: 'time',
                time: {
                  displayFormats: {
                    millisecond: 'mm:ss.SSS',
                  },
                  unit: 'millisecond',
                  stepSize: getStepSize(),
                },
              },
              yAxis: {
                display: props.yDisplay,
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 100,
                },
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
    const datasets = props.metrics?.map((m, index) => {
      return {
        label: m.label || '',
        data: m.data,
        borderColor:
          props.color?.length > 0
            ? props.color[index % props.color.length]
            : props.colorful
            ? LINE_THEME_FUL_COLORS[index % 10]
            : getComputedStyle(document.documentElement)
                .getPropertyValue(LINE_THEME_COLORS[index % 10].replaceAll('var(', '').replaceAll(')', ''))
                ?.trim(),
        backgroundColor:
          props.color?.length > 0
            ? props.color[index % props.color.length]
            : props.colorful
            ? LINE_THEME_FUL_COLORS[index % 10]
            : getComputedStyle(document.documentElement)
                .getPropertyValue(LINE_THEME_COLORS[index % 10].replaceAll('var(', '').replaceAll(')', ''))
                ?.trim(),
      };
    });

    return datasets;
  };

  const getStepSize = (): number => {
    const range = props.duration;
    if (range < 100) {
      return 1;
    }
    if (range < 200) {
      return 2;
    }
    if (range < 300) {
      return 3;
    }
    if (range < 500) {
      return 5;
    }
    if (range < 1000) {
      return 10;
    }
    if (range < 5000) {
      return 50;
    }
    if (range < 10000) {
      return 100;
    }
    if (range < 100000) {
      return 1000;
    }
    return 1000;
  };

  const getHeight = (items: any): number => {
    if (items?.length) {
      if (items.length <= 10) {
        return 40 * items.length + 36;
      } else if (items.length <= 15) {
        return 31.6 * items.length;
      } else if (items.length <= 20) {
        return 31.1 * items.length;
      } else if (items.length < 30) {
        return 30.5 * items.length;
      } else {
        return 29.8 * items.length;
      }
    }
    return 0;
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
          height.value = getHeight(props.metrics?.length ? props.metrics[0].data : null);
          loadChart();
        }
      }, 300);
    });
  });

  watch(
    () => props.metrics,
    async (newValue) => {
      if (newValue && newValue?.length >= 0 && document.getElementById(chartId.value)) {
        height.value = getHeight(newValue[0].data);
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
