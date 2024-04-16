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
  <div :style="{ height: `${extendHeight}px`, position: 'relative', width: width }">
    <canvas v-if="mustCheckPremission" :id="chartId" />
    <div v-else class="text-center kubegems__full-center text-caption">
      {{ i18n.t('plugin.missing', ['monitoring']) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@kubegems/libs/constants/chart';
  import { randomString } from '@kubegems/libs/utils/helpers';
  import Chart, { Align, InteractionMode, ScatterDataPoint } from 'chart.js/auto';
  import 'chartjs-adapter-moment';
  import zoomPlugin from 'chartjs-plugin-zoom';
  import moment from 'moment';
  import { ComputedRef, computed, nextTick, onMounted, ref, watch } from 'vue';

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
      animation?: false | any;
      beginAtZero?: boolean;
      chartType?: string;
      globalPluginsCheck?: boolean;
      label?: string;
      legendAlign?: string;
      mode?: string;
      precision?: number;
      sample?: boolean;
      singleTooptip?: boolean;
      stacked?: boolean;
      timeDisplay?: string;
      type?: string;
      unit?: string;
      width?: string;
      zoom?: boolean;
      timeType?: string;
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
      animation: false,
      beginAtZero: false,
      chartType: 'area',
      globalPluginsCheck: true,
      label: '',
      legendAlign: 'center',
      mode: 'index',
      precision: 2,
      sample: false,
      singleTooptip: false,
      stacked: false,
      timeDisplay: 'HH:mm:ss',
      type: undefined,
      unit: '',
      width: '100%',
      zoom: false,
      timeType: 'timeseries',
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();
  const params = useParams();

  const allUnit = {
    short: ['n', 'u', 'm', '', 'K', 'Mil', 'Bil', 'Tri'],
    bytes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
    'bytes/sec': ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'],
    duration: ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'],
    percent: ['0-100', '0.0-1.0'],

    cpu: ['n', 'u', 'm', 'core', 'k'],
    memory: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
    storage: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
    network: ['bps', 'Kbps', 'Mbps', 'Gbps'],
    timecost: ['us', 'ms', 's'],
    reqrate: ['req/s'],
    count: ['', 'k', 'm'],
  };

  const chart = ref<any>(undefined);
  const chartId = ref<string>('');
  const legendIndexs = ref<any>([]);

  const mustCheckPremission: ComputedRef<boolean> = computed(() => {
    return (
      (store.state.Plugins && store.state.Plugins['monitoring']) || !store.state.Plugins || !props.globalPluginsCheck
    );
  });

  const options = computed(() => {
    const _option = {
      plugins: [zoomPlugin],
      type: 'line',
      data: {
        labels: props.labels,
        datasets: loadDatasets(),
      },
      options: {
        animation: props.animation,
        spanGaps: true,
        datasets: {
          line: {
            pointRadius: 0,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          zoom: {
            pan: {
              enabled: props.zoom,
              modifierKey: 'ctrl',
            },
            zoom: {
              drag: {
                enabled: props.zoom,
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
              },
              mode: 'x',
              onZoomComplete: ({ chart }) => {
                const { min, max } = chart.scales.x;
                emit('refresh', min, max);
              },
            },
          },
          title: {
            align: 'start',
            display: Boolean(props.title),
            text: props.title,
          },
          legend: {
            display: props.labelShow && !props.sample,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 10,
              boxHeight: 7,
            },
            align: props.legendAlign as Align,
            onClick: (e, legendItem, legend) => {
              const ci = legend.chart;
              const index = legendItem.datasetIndex;
              const legendIndex = legendIndexs.value.indexOf(index);
              if (legendIndex > -1) {
                legendIndexs.value.splice(legendIndex, 1);
              } else {
                legendIndexs.value.push(index);
              }

              const showAll = legendIndexs.value?.length === 0;

              legend.legendItems.forEach((item) => {
                const i = item.datasetIndex;
                if (showAll) {
                  ci.show(i);
                  item.hidden = false;
                } else {
                  if (legendIndexs.value.indexOf(i) > -1) {
                    ci.show(i);
                    item.hidden = false;
                  } else {
                    ci.hide(i);
                    item.hidden = true;
                  }
                }
              });
            },
          },
          tooltip: {
            enabled: !props.singleTooptip,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            boxPadding: 4,
            callbacks: {
              label: (tooltipItem) => {
                return `${tooltipItem.dataset.label} : ${formatter(
                  (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).y,
                )}`;
              },
            },
            external: props.singleTooptip ? externalTooltipHandler : null,
            mode: props.singleTooptip ? ('nearest' as InteractionMode) : (props.mode as InteractionMode),
          },
        },
        radius: 0,
        borderWidth: props.chartType === 'line' ? 2 : 1,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            display: !props.sample,
            grid: {
              borderDash: [8, 8, 8],
              drawBorder: false,
            },
            ticks: {
              callback: (value) => {
                return formatter(value);
              },
              maxTicksLimit: 8,
            },
            beginAtZero: props.beginAtZero,
            min: props.type === 'percent' || ['0-100', '0.0-1.0'].indexOf(props.unit) > -1 ? 0 : null,
            stacked: props.stacked,
          },
          x: {
            display: !props.sample,
            grid: {
              display: false,
            },
            type: props.timeType,
            time: {
              unit: 'second',
              displayFormats: {
                second: props.timeDisplay,
              },
              tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
              stepSize: 200,
            },
          },
        },
      },
    };
    const min = getSuggestMinVal();
    const max = getSuggestMaxVal();
    if (
      props.type !== '%' &&
      props.type !== 'percent' &&
      ['0-100', '0.0-1.0'].indexOf(props.unit) === -1 &&
      (min || max)
    ) {
      (_option.options.scales.y as any).suggestedMin = min;
      (_option.options.scales.y as any).suggestedMax = max;
    }
    return _option;
  });

  const emit = defineEmits(['refresh']);
  const loadChart = (): void => {
    if (!mustCheckPremission.value) return;
    if (!chart.value) {
      const ctx = (document.getElementById(chartId.value) as HTMLCanvasElement).getContext('2d');
      chart.value = new Chart(ctx as any, options.value as any);
    } else {
      chart.value.data = { datasets: loadDatasets() };
      chart.value.update('none');
    }
  };

  const getOrCreateTooltip = (chart: any, tooltip: any): any => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    const width = chart.width;
    const x = tooltip.caretX;

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = `translate(-${(x / width) * 100}%, 0)`;
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.fontSize = '12px';
      tooltipEl.style.zIndex = '15';
      tooltipEl.style.minWidth = '300px';
      // tooltipEl.style.maxWidth = '400px';

      const table = document.createElement('table');
      table.style.margin = '0px';
      table.style.width = '100%';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    } else {
      tooltipEl.style.transform = `translate(-${(x / width) * 100}%, 0)`;
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context: any): void => {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart, tooltip);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    // Set Text
    if (tooltip.body) {
      const bodyLines = tooltip.body.map((b) => b.lines);

      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body, i) => {
        const bodySlice = body[0].split(':');
        const numberic = bodySlice[bodySlice?.length - 1].trim();
        const colors = tooltip.labelColors[i];

        const datasetIndex = tooltip.dataPoints[0].datasetIndex;
        const metric = props.metrics?.[datasetIndex].metric;
        const key = props.metrics?.[datasetIndex].key;

        const divPoint = document.createElement('div');
        divPoint.style.background = colors.backgroundColor;
        divPoint.style.borderColor = colors.borderColor;
        divPoint.style.borderWidth = '2px';
        divPoint.style.marginRight = '10px';
        divPoint.style.height = '12px';
        divPoint.style.width = '12px';
        divPoint.style.display = 'inline-block';
        divPoint.style.borderRadius = '12px';
        divPoint.style.float = 'left';
        divPoint.style.marginTop = '4px';

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = '0';

        const td = document.createElement('td');
        td.style.borderWidth = '0';

        const divTitle = document.createElement('div');
        if (key) {
          divTitle.innerText = `${key}-${tooltip.title[0]}`;
        } else {
          divTitle.innerText = tooltip.title[0];
        }
        divTitle.style.float = 'left';

        const divNumberic = document.createElement('div');
        divNumberic.innerText = numberic;
        divNumberic.style.float = 'right';
        divNumberic.style.marginLeft = '4px';

        const divClear = document.createElement('div');
        divClear.style.clear = 'both';

        td.appendChild(divPoint);
        td.appendChild(divTitle);
        td.appendChild(divNumberic);
        td.appendChild(divClear);

        Object.keys(metric).forEach((label) => {
          if (label !== '__name__') {
            const div = document.createElement('div');
            const divLeft = document.createElement('div');
            divLeft.innerText = `${label} :`;
            divLeft.style.float = 'left';
            const divRight = document.createElement('div');
            divRight.innerText = `${metric[label]}`;
            divRight.style.float = 'left';
            divRight.style.wordBreak = 'break-all';
            const divClear = document.createElement('div');
            divClear.style.clear = 'both';
            div.appendChild(divLeft);
            div.appendChild(divRight);
            div.appendChild(divClear);
            td.appendChild(div);
          }
        });

        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableRoot = tooltipEl.querySelector('table');

      // Remove old children
      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }

      // Add new children
      tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };

  const getMetricName = (metricAndValues: any, index: number): string => {
    if (metricAndValues.metric) {
      if (props.label === 'all') {
        return `{${Object.keys(metricAndValues.metric).map((k) => {
          return `${k}=${metricAndValues.metric[k]}`;
        })}}`;
      }
      if (metricAndValues.metric[props.label]) {
        return metricAndValues.metric[props.label];
      }
      if (metricAndValues.metric['container']) {
        return metricAndValues.metric['container'];
      }
      if (Object.values(metricAndValues.metric)?.length > 0) {
        return (Object.values(metricAndValues.metric) as any[])[0].toString();
      }
    }
    return params.value.name || `${i18n.t('data.data')}${index + 1}`;
  };

  const loadDatasets = (): any[] => {
    const datasets = props.metrics?.map((m, index) => {
      return {
        label: getMetricName(m, index),
        data: m.values.map((v) => {
          return { x: moment(new Date(v[0] * 1000)), y: v[1] };
        }),
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
        fill: props.chartType === 'area',
        cubicInterpolationMode: 'default',
        tension: 0.3,
      };
    });

    return datasets;
  };

  const getType = (): string | undefined => {
    if (props.unit === 'short') {
      return 'short';
    }
    return Object.keys(allUnit).find((u) => {
      const inUnit = allUnit[u].some((n) => {
        return n.toLocaleLowerCase() === props.unit.toLocaleLowerCase();
      });
      return inUnit;
    });
  };

  const unitBase = (
    scaleNum: number,
    unitType: string,
    value: string | number,
  ): { scaleNum: string; unitType: string; newValue: number | string } => {
    switch (unitType) {
      case 'memory':
      case 'storage':
      case 'network':
      case 'bytes':
      case 'bytes/sec':
        scaleNum = 1024;
        break;
      case 'cpu':
      case 'timecost':
      case 'short':
        scaleNum = 1000;
        break;
      case 'seconds':
        scaleNum = 60;
        break;
      case 'percent':
        scaleNum = 100;
        break;
      case 'reqrate':
        break;
      case 'duration':
        break;
      case '%':
        return {
          scaleNum: `${parseFloat(value as string).toFixed(props.precision)} ${unitType}`,
          unitType: '',
          newValue: value,
        };
        break;
      default:
        if (props.unit) {
          unitType = getType() as string;
          if (unitType) {
            return unitBase(scaleNum, unitType, value);
          } else {
            return {
              scaleNum: `${parseFloat(value as string).toFixed(props.precision)} ${props.unit}`,
              unitType: '',
              newValue: value,
            };
          }
        }
        return {
          scaleNum: `${parseFloat(value as string).toFixed(props.precision)} ${unitType}`,
          unitType: '',
          newValue: value,
        };
    }
    if (props.unit) {
      const d = allUnit[unitType].findIndex((u) => {
        return u.toLocaleLowerCase() === props.unit.toLocaleLowerCase();
      });

      if (unitType === 'duration') {
        if (d <= 3) {
          value = (value as number) * Math.pow(1000, d);
        } else if (d <= 5) {
          value = (value as number) * Math.pow(1000, 3) * Math.pow(60, d - 3);
        } else if (d <= 6) {
          value = (value as number) * Math.pow(1000, 3) * Math.pow(60, 2) * Math.pow(24, d - 5);
        } else {
          value = (value as number) * Math.pow(1000, 3) * Math.pow(60, 2) * Math.pow(24, 1) * Math.pow(7, d - 6);
        }
      } else if (unitType === 'short') {
        value = (value as number) * Math.pow(scaleNum, 3);
      } else {
        value = (value as number) * Math.pow(scaleNum, d);
      }
    }
    return { scaleNum: scaleNum.toString(), unitType: unitType, newValue: value };
  };

  const beautifyUnit = (num: string, sclaeNum: number, units: string[] = [], unitType = ''): string => {
    let result = parseFloat(num);
    for (const index in units) {
      if (Math.abs(result) <= sclaeNum || parseInt(index) === units?.length - 1) {
        if (unitType === 'percent') {
          // 特殊处理
          if (result > 1 && result < 1.001) {
            return `${(result * 100).toFixed(props.precision)} %`;
          } else {
            return `${result.toFixed(props.precision)} %`;
          }
        }
        return `${result.toFixed(props.precision)} ${units[index]}`;
      }
      result /= sclaeNum;
    }
    if (unitType === 'percent') {
      return `${result.toFixed(props.precision)} %`;
    }
    return `${result.toFixed(props.precision)} Yi`;
  };

  const beautifyDurationUnit = (num: string): string => {
    let result = parseFloat(num);
    const units = ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'];
    let sclaeNum = 1000;
    for (const index in units) {
      if (parseInt(index) < 3) {
        sclaeNum = 1000;
      } else if (parseInt(index) < 5) {
        sclaeNum = 60;
      } else if (parseInt(index) < 6) {
        sclaeNum = 24;
      } else {
        sclaeNum = 7;
      }
      if (Math.abs(result) <= sclaeNum || parseInt(index) === 7) {
        return `${result.toFixed(props.precision)} ${units[index]}`;
      }
      result /= sclaeNum;
    }
    return `${result.toFixed(props.precision)} Yi`;
  };

  const formatter = (value: number | string): string => {
    if (value === 0) return '0';
    if (isNaN(value as number)) return '0';
    if (!value) return '';
    const { scaleNum, unitType, newValue } = unitBase(0, props.type, value);
    value = newValue;
    if (!unitType) {
      return scaleNum;
    }
    if (unitType === 'duration') {
      return beautifyDurationUnit(value.toString());
    } else {
      return beautifyUnit(value.toString(), parseFloat(scaleNum), allUnit[unitType], unitType);
    }
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

  const getMinVal = () => {
    const val = [];
    props.metrics?.forEach((m) => {
      m?.values?.forEach((v) => {
        val.push(parseFloat(v?.[1] || 0));
      });
    });
    return Math.min(...val);
  };

  const getMaxVal = () => {
    const val = [];
    props.metrics?.forEach((m) => {
      m?.values?.forEach((v) => {
        val.push(parseFloat(v?.[1] || 1));
      });
    });
    return Math.max(...val);
  };

  const getSuggestMinVal = () => {
    const _min = getMinVal();
    const _max = getMaxVal();
    if (_min < 100 && _max - _min < 2) return _min < 5 ? 0 : _min - 5;
    if (_min < 1000 && _max - _min < 20) return _min < 50 ? 0 : _min - 50;
    if (_min < 10000 && _max - _min < 200) return _min < 500 ? 0 : _min - 500;
    if (_min < 100000 && _max - _min < 2000) return _min < 5000 ? 0 : _min - 5000;
    if (_min < 1000000 && _max - _min < 20000) return _min < 50000 ? 0 : _min - 50000;
    return null;
  };

  const getSuggestMaxVal = () => {
    const _min = getMinVal();
    const _max = getMaxVal();
    if (_max < 100 && _max - _min < 2) return _max + 5;
    if (_max < 1000 && _max - _min < 20) return _max + 50;
    if (_max < 10000 && _max - _min < 200) return _max + 500;
    if (_max < 100000 && _max - _min < 2000) return _max + 5000;
    if (_max < 1000000 && _max - _min < 20000) return _max + 50000;
    return null;
  };
</script>
