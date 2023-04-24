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
  import { beautifyTime, randomString } from '@kubegems/libs/utils/helpers';
  import Chart, { ScatterDataPoint } from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
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
      horizontal?: boolean;
      type?: string;
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
      horizontal: false,
      type: '',
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
          type: 'bar',
          plugins: [ChartDataLabels],
          data: {
            labels: props.labels,
            datasets: loadDatasets(),
          },
          options: {
            indexAxis: props.horizontal ? 'y' : 'x',
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
                    return props.horizontal
                      ? props.type === 'time'
                        ? beautifyTime(
                            (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x?.toString(),
                            1000000,
                          )
                        : (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x?.toFixed(1)
                      : (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).y?.toString();
                  },
                },
              },
              datalabels: {
                color: 'green',
                align: 'right',
                anchor: 'end',
                display: (context) => {
                  if (!props.horizontal) return false;
                  return context.dataset.data[context.dataIndex] !== null ? 'auto' : false;
                },
                formatter: (value, context) => {
                  return props.horizontal
                    ? props.type === 'time'
                      ? (context.dataset.data[context.dataIndex] as ScatterDataPoint).x /
                          (context.dataset.data[0] as ScatterDataPoint).x <
                        0.3
                        ? `${value.y}  ${beautifyTime(value.x, 1000000)}`
                        : beautifyTime(value.x, 1000000)
                      : (context.dataset.data[context.dataIndex] as ScatterDataPoint).x /
                          (context.dataset.data[0] as ScatterDataPoint).x <
                        0.3
                      ? `${value.y}  ${value.x.toFixed(1)}`
                      : value.x.toFixed(1)
                    : value.y;
                },
              },
            },
            radius: 0,
            borderWidth: 1,
            scales: {
              xAxis: {
                display: !props.horizontal,
                grid: {
                  display: false,
                },
              },
              yAxis: {
                display: !props.horizontal,
                grid: {
                  borderDash: [8, 8, 8],
                  drawBorder: false,
                },
                ticks: {
                  maxTicksLimit: props.horizontal ? 20 : 8,
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
        datalabels: {
          labels: {
            name: {
              align: (context) => {
                return context.dataset.data[context.dataIndex].x / context.dataset.data[0].x < 0.3 ? 'left' : 'right';
              },
              anchor: 'start',
              color: (context) => {
                return context.dataset.data[context.dataIndex].x / context.dataset.data[0].x < 0.3 ? 'grey' : 'white';
              },
              formatter: function (value) {
                return value.y;
              },
            },
            value: {},
          },
        },
      };
    });

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
