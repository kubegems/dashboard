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
  <BaseDialog v-model="dialog" icon="mdi-rocket" :title="$t('tip.resource_limit')" :width="800" @reset="reset">
    <template #content>
      <v-card v-if="adviseItem && item" flat>
        <v-card-text v-for="obj in item.spec.template.spec.containers" :key="obj.name" class="pa-0 mb-8">
          <div v-if="hasAdvise(obj.name)">
            <BaseSubTitle :title="`${$root.$t('resource.container')}:${obj.name}`" />
            <v-alert
              border="left"
              class="mt-3 mx-2 text-body-2 py-4"
              :color="`${adviseItem.Color === 'red' ? 'error' : 'warning'}`"
              colored-border
              elevation="1"
            >
              {{ getAdviseShow(obj) }}
            </v-alert>
            <v-card-text class="pa-0">
              <p class="text-subtitle-2 px-2 primary--text mt-0"> {{ $t('tip.cpu_limit') }} </p>
              <v-card-text
                v-if="sliderItems[obj.name]"
                :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} pt-1 px-4 mt-6`"
              >
                <VueSlider
                  v-model="sliderItems[obj.name].cpu.value"
                  :adsorb="true"
                  :enable-cross="false"
                  :interval="sliderItems[obj.name].cpu.interval"
                  :marks="sliderItems[obj.name].cpu.marks"
                  :max="sliderItems[obj.name].cpu.max"
                  process-style="background-color:#3498db"
                  :tooltip="'always'"
                >
                  <template #tooltip="props">
                    <div class="tooltip">
                      <span>{{ getUnitValue(props.value, sliderItems[obj.name].cpu) }}</span>
                    </div>
                  </template>
                </VueSlider>
              </v-card-text>
            </v-card-text>
            <p class="text-subtitle-2 px-2 primary--text mt-4">{{ $t('tip.memory_limit') }}</p>
            <v-card-text
              v-if="sliderItems[obj.name]"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} pt-1 px-4 mt-6`"
            >
              <VueSlider
                v-model="sliderItems[obj.name].memory.value"
                :adsorb="true"
                :enable-cross="false"
                :marks="sliderItems[obj.name].memory.marks"
                :max="sliderItems[obj.name].memory.max"
                process-style="background-color:#3498db"
                :tooltip="'always'"
              >
                <template #tooltip="props">
                  <div class="tooltip">
                    <span>{{ getUnitValue(props.value, sliderItems[obj.name].memory) }}</span>
                  </div>
                </template>
              </VueSlider>
            </v-card-text>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateWorkloadResource">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import VueSlider from 'vue-slider-component';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import {
    getDaemonSetDetail,
    getDeploymentDetail,
    getStatefulSetDetail,
    patchUpdateDaemonSet,
    patchUpdateDeployment,
    patchUpdateDeploymentArgo,
    patchUpdateStatefulSet,
  } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { beautifyCpuUnit, beautifyStorageUnit, deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  import 'vue-slider-component/theme/default.css';

  export default {
    name: 'ResourceLimit',
    i18n: {
      messages: messages,
    },
    components: {
      VueSlider,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      item: null,
      workload: null,
      type: '',
      adviseItem: {},
      sliderItems: {},
      cpuRange: [1, 2, 4, 8, 16],
      memoryRange: [1, 2, 4, 8, 16, 32, 64],
    }),
    computed: {
      ...mapState(['Circular', 'Scale']),
      isArgoApp() {
        return (
          this.item &&
          this.item.metadata &&
          this.item.metadata.annotations &&
          this.item.metadata.annotations[`gems.kubegems.io/ref`]
        );
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      getUnitValue(value, sliderItem) {
        return sliderItem.mapValue[value];
      },
      setValue(sliderItem, value, index = 0) {
        const valueIndex = sliderItem.mapValue.indexOf(value);
        this.$set(sliderItem.value, index, valueIndex);
      },
      hasAdvise(containerName) {
        return this.adviseItem.Conditions[containerName];
      },
      getAdviseShow(c) {
        if (this.adviseItem.Conditions[c.name].CPUStatus === null) {
          this.adviseItem.Conditions[c.name].CPUStatus = { Suggestion: '' };
        }
        if (this.adviseItem.Conditions[c.name].MemoryStatus === null) {
          this.adviseItem.Conditions[c.name].MemoryStatus = { Suggestion: '' };
        }
        const containerAdvise = this.hasAdvise(c.name);
        if (containerAdvise) {
          return containerAdvise.CPUStatus.Suggestion + containerAdvise.MemoryStatus.Suggestion;
        }
      },

      async updateWorkloadResource() {
        // 用滑块值替换item默认建议值
        this.workload.spec.template.spec.containers.forEach((c) => {
          if (this.sliderItems[c.name]) {
            c.resources.requests.cpu = this.sliderItems[c.name].cpu.mapValue[this.sliderItems[c.name].cpu.value[0]];
            c.resources.limits.cpu = this.sliderItems[c.name].cpu.mapValue[this.sliderItems[c.name].cpu.value[1]];
            c.resources.requests.memory =
              this.sliderItems[c.name].memory.mapValue[this.sliderItems[c.name].memory.value[0]];
            c.resources.limits.memory =
              this.sliderItems[c.name].memory.mapValue[this.sliderItems[c.name].memory.value[1]];
            if (c.resources.requests.cpu === 0) {
              this.$delete(c.resources.requests, 'cpu');
            }
            if (c.resources.limits.cpu === 0) {
              this.$delete(c.resources.limits, 'cpu');
            }
            if (c.resources.requests.memory === 0) {
              this.$delete(c.resources.requests, 'memory');
            }
            if (c.resources.limits.memory === 0) {
              this.$delete(c.resources.limits, 'memory');
            }
            // TODO 校验区间,必要时给出提示,匹配容器名,CPU,内存是否满足建议区间,弹窗给出相应的提示
          }
        });
        const kind = this.type;
        if (this.isArgoApp) {
          await patchUpdateDeploymentArgo(
            this.ThisCluster,
            this.workload.metadata.namespace,
            this.workload.metadata.name,
            kind,
            this.workload,
          );
        } else {
          if (kind === 'DaemonSet') {
            await patchUpdateDaemonSet(
              this.ThisCluster,
              this.workload.metadata.namespace,
              this.workload.metadata.name,
              this.workload,
            );
          } else if (kind === 'Deployment') {
            await patchUpdateDeployment(
              this.ThisCluster,
              this.workload.metadata.namespace,
              this.workload.metadata.name,
              this.workload,
            );
          } else if (kind === 'StatefulSet') {
            await patchUpdateStatefulSet(
              this.ThisCluster,
              this.workload.metadata.namespace,
              this.workload.metadata.name,
              this.workload,
            );
          }
        }
        // 清除建议
        this.$emit('clearAdvise', this.adviseItem);
        this.reset();
      },
      // 获取最新的工作负载
      async workloadDetail() {
        if (this.type === 'DaemonSet') {
          this.workload = await getDaemonSetDetail(
            this.ThisCluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
          );
        } else if (this.type === 'Deployment') {
          this.workload = await getDeploymentDetail(
            this.ThisCluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
          );
        } else if (this.type === 'StatefulSet') {
          this.workload = await getStatefulSetDetail(
            this.ThisCluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
          );
        }
        // 遍历工作负载中的容器组
        this.workload.spec.template.spec.containers.forEach((c) => {
          // 保留一份resources
          const resourcesBackup = c.resources;
          const resourcesDefault = {
            requests: { cpu: '0', memory: '0' },
            limits: { cpu: '0', memory: '0' },
          };
          if (!this.adviseItem || !this.adviseItem.Conditions[c.name]) return;
          // 有资源建议则合并resources配置
          if (this.adviseItem.Conditions[c.name]) {
            const resourcesMege = this.$_.merge(resourcesDefault, c.resources);
            c.resources = resourcesMege;
          }
          // cpu limits=建议值
          if (
            this.adviseItem.Conditions[c.name].CPUStatus &&
            this.adviseItem.Conditions[c.name].CPUStatus.SuggestLimit
          ) {
            c.resources.limits.cpu = this.adviseItem.Conditions[c.name].CPUStatus.SuggestLimit;
          }
          if (
            this.adviseItem.Conditions[c.name].MemoryStatus &&
            this.adviseItem.Conditions[c.name].MemoryStatus.SuggestLimit
          ) {
            c.resources.limits.memory = this.adviseItem.Conditions[c.name].MemoryStatus.SuggestLimit;
          }
          const sliderItem = {
            cpu: {
              max: 20,
              value: [0, 0],
              interval: 1,
              marks: {},
              mapValue: [],
              maxLimit: 0,
            },
            memory: {
              max: 16,
              value: [0, 0],
              interval: 1,
              marks: {},
              mapValue: [],
              maxLimit: 0,
            },
          };
          // 当前请求值
          const cpuRequests = this.getValueNoUnit(c.resources.requests.cpu, 'CPU');
          // 当前建议值
          const adviseCpuLimits = this.getValueNoUnit(c.resources.limits.cpu, 'CPU');
          const cpuSuggestMinLimit = this.getValueNoUnit(
            this.adviseItem.Conditions[c.name].CPUStatus.SuggestMinLimit,
            'CPU',
          );
          const cpuSuggestMaxLimit = this.getValueNoUnit(
            this.adviseItem.Conditions[c.name].CPUStatus.SuggestMaxLimit,
            'CPU',
          );

          // 获取最大值
          let cpuMaxLimitWithUnit = null;
          switch (this.adviseItem.Conditions[c.name]['CPUStatus'].Action) {
            case 'scaleUp':
              cpuMaxLimitWithUnit = this.getAdviseMaxValue(c.name, 'CPUStatus');
              break;
            case 'scaleDown':
              cpuMaxLimitWithUnit = this.getAdviseValue(c.name, 'CPUStatus');
              break;
            default:
              cpuMaxLimitWithUnit = resourcesBackup.limits?.cpu || 0;
          }
          // 获取最靠近的值, 先转为核
          const cpuMaxLimitClosest = this.getClosest(this.cpuRange, this.getValueNoUnit(cpuMaxLimitWithUnit, 'CPU'));

          this.setMarks(sliderItem.cpu, cpuMaxLimitClosest, 'CPU');
          this.$set(sliderItem.cpu, 'maxLimit', cpuMaxLimitClosest);
          this.generateMapValue(sliderItem.cpu, 'CPU');

          // 找cpuSuggestMinLimit和cpuSuggestMaxLimit对应的键,统一单位
          const cpuMapValueNoUnit = sliderItem.cpu.mapValue.map((item) => {
            return this.getValueNoUnit(item, 'CPU');
          });
          // 寻找index
          const cpuSuggestMaxLimitClose = this.getClosest(cpuMapValueNoUnit, cpuSuggestMaxLimit);
          const cpuSuggestMinLimitClose = this.getClosest(cpuMapValueNoUnit, cpuSuggestMinLimit);

          const cpuSuggestLimitClose = this.getClosest(cpuMapValueNoUnit, adviseCpuLimits);

          const cpuSuggestMaxLimitIndex = cpuMapValueNoUnit.indexOf(cpuSuggestMaxLimitClose);
          const cpuSuggestMinLimitIndex = cpuMapValueNoUnit.indexOf(cpuSuggestMinLimitClose);
          const cpuSuggestLimitIndex = cpuMapValueNoUnit.indexOf(cpuSuggestLimitClose);
          // 标记mark
          this.$set(sliderItem.cpu.marks, cpuSuggestMaxLimitIndex, sliderItem.cpu.mapValue[cpuSuggestMaxLimitIndex]);
          this.$set(sliderItem.cpu.marks, cpuSuggestMinLimitIndex, sliderItem.cpu.mapValue[cpuSuggestMinLimitIndex]);

          // 设置双滑块左右值
          this.setValue(sliderItem.cpu, this.getBeautifyCpuUnit(this.getClosest(cpuMapValueNoUnit, cpuRequests)), 0);
          this.setValue(sliderItem.cpu, sliderItem.cpu.mapValue[cpuSuggestLimitIndex], 1);
          // 内存
          const memoryRequests = this.getValueNoUnit(c.resources.requests.memory, 'Memory');

          const adviseMemoryLimits = this.getValueNoUnit(c.resources.limits.memory, 'Memory');
          const memorySuggestMinLimit = this.getValueNoUnit(
            this.adviseItem.Conditions[c.name].MemoryStatus.SuggestMinLimit,
            'Memory',
          );
          const memorySuggestMaxLimit = this.getValueNoUnit(
            this.adviseItem.Conditions[c.name].MemoryStatus.SuggestMaxLimit,
            'Memory',
          );

          // 获取最大值
          let memoryMaxLimitWithUnit = null;
          switch (this.adviseItem.Conditions[c.name]['MemoryStatus'].Action) {
            case 'scaleUp':
              memoryMaxLimitWithUnit = this.getAdviseMaxValue(c.name, 'MemoryStatus');
              break;
            case 'scaleDown':
              memoryMaxLimitWithUnit = this.getAdviseValue(c.name, 'MemoryStatus');
              break;
            default:
              memoryMaxLimitWithUnit = resourcesBackup.limits?.memory || 0;
          }
          // 获取最靠近的值, 先转为核
          const memoryMaxLimitClosest = this.getClosest(
            this.memoryRange,
            this.getValueNoUnit(memoryMaxLimitWithUnit, 'Memory'),
          );

          this.setMarks(sliderItem.memory, memoryMaxLimitClosest, 'Memory');
          this.$set(sliderItem.memory, 'maxLimit', memoryMaxLimitClosest);
          this.generateMapValue(sliderItem.memory, 'Memory');
          const memoryMapValueNoUnit = sliderItem.memory.mapValue.map((item) => {
            return this.getValueNoUnit(item, 'Memory');
          });
          // 寻找index
          const memorySuggestMaxLimitClose = this.getClosest(memoryMapValueNoUnit, memorySuggestMaxLimit);
          const memorySuggestMinLimitClose = this.getClosest(memoryMapValueNoUnit, memorySuggestMinLimit);
          const memorySuggestLimitClose = this.getClosest(memoryMapValueNoUnit, adviseMemoryLimits);
          const memorySuggestMaxLimitIndex = memoryMapValueNoUnit.indexOf(memorySuggestMaxLimitClose);
          const memorySuggestMinLimitIndex = memoryMapValueNoUnit.indexOf(memorySuggestMinLimitClose);
          const memorySuggestLimitIndex = memoryMapValueNoUnit.indexOf(memorySuggestLimitClose);
          // 标记mark
          this.$set(
            sliderItem.memory.marks,
            memorySuggestMaxLimitIndex,
            sliderItem.memory.mapValue[memorySuggestMaxLimitIndex],
          );
          this.$set(
            sliderItem.memory.marks,
            memorySuggestMinLimitIndex,
            sliderItem.memory.mapValue[memorySuggestMinLimitIndex],
          );

          this.setValue(
            sliderItem.memory,
            this.getBeautifyStorageUnit(this.getClosest(memoryMapValueNoUnit, memoryRequests)),
            0,
          );
          this.setValue(sliderItem.memory, sliderItem.memory.mapValue[memorySuggestLimitIndex], 1);
          this.$set(this.sliderItems, c.name, sliderItem);
        });
      },
      getAdviseValue(containerName, statusKey) {
        return this.adviseItem.Conditions[containerName][statusKey] &&
          this.adviseItem.Conditions[containerName][statusKey].CurrentLimit
          ? this.adviseItem.Conditions[containerName][statusKey].CurrentLimit
          : '0';
      },
      getAdviseMaxValue(containerName, statusKey) {
        return this.adviseItem.Conditions[containerName][statusKey] &&
          this.adviseItem.Conditions[containerName][statusKey].SuggestMaxLimit
          ? this.adviseItem.Conditions[containerName][statusKey].SuggestMaxLimit
          : '0';
      },
      getValueNoUnit(valueWithUnit, type = 'CPU') {
        if (type === 'CPU') {
          return sizeOfCpu(!isNaN(valueWithUnit) ? `${valueWithUnit}core` : valueWithUnit, 'core');
        } else if (type === 'Memory') {
          const regExp = new RegExp(/(K|M|G|T|P|E|Z)$/, 'g');

          return valueWithUnit ? sizeOfStorage(valueWithUnit.replace(regExp, '$1' + 'i'), 'Gi') : 0;
        }
      },
      setMarks(sliderObj, maxLimit, type = 'CPU') {
        // 2分法
        if (type === 'CPU') {
          this.$set(sliderObj, 'marks', {
            0: 0,
            10: this.getBeautifyCpuUnit(maxLimit / 4.0),
            15: this.getBeautifyCpuUnit(maxLimit / 2.0),
            20: this.getBeautifyCpuUnit(maxLimit / 1.0),
          });
        } else if (type === 'Memory') {
          this.$set(sliderObj, 'marks', {
            0: 0,
            8: this.getBeautifyStorageUnit(maxLimit / 4.0),
            12: this.getBeautifyStorageUnit(maxLimit / 2.0),
            16: this.getBeautifyStorageUnit(maxLimit / 1.0),
          });
        }
      },
      getBeautifyCpuUnit(inputValue) {
        const regExp = new RegExp(/\.0|core|\s|0\.0 n|0 n|000\.0 m/, 'g');
        const result = beautifyCpuUnit(inputValue * 1000 * 1000 * 1000, 1).replace(regExp, '');
        return result === '' ? 0 : result;
      },
      getBeautifyStorageUnit(inputValue) {
        const regExp = new RegExp(/\.0|core|\s|0\.0 B|0 B/, 'g');
        const result = beautifyStorageUnit(inputValue * 1024 * 1024 * 1024, 1).replace(regExp, '');
        return result === '' ? 0 : result;
      },
      // 生成映射值
      generateMapValue(sliderObj, type = 'CPU') {
        const markKeys = Object.keys(sliderObj.marks)
          .map((item) => {
            return parseInt(item);
          })
          .filter((item) => {
            return item !== 0;
          });
        const perNum = sliderObj.maxLimit / (sliderObj.max * 2);
        let sum = 0;
        // Array.from() 方法从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例
        sliderObj.mapValue = Array.from({ length: sliderObj.max + 1 }, (item, index) => {
          return (sum +=
            perNum *
            Math.pow(
              2,
              markKeys.findIndex((p) => {
                return index <= p;
              }),
            ));
        }).map((item) => {
          return type === 'CPU' ? this.getBeautifyCpuUnit(item - perNum) : this.getBeautifyStorageUnit(item - perNum);
        });
      },
      getClosest(arr, target) {
        return arr.reduce(function (prev, curr) {
          return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
        });
      },
      async init(item, kind, adviseItem) {
        this.type = kind;
        this.item = deepCopy(item);
        this.adviseItem = deepCopy(adviseItem);
        await this.workloadDetail();
      },
      reset() {
        this.type = '';
        this.item = null;
        this.adviseItem = null;
        this.dialog = false;
      },
    },
  };
</script>

<style lang="scss">
  .tooltip {
    font-size: 15px;
    margin-bottom: -6px;
    font-family: Arial, sans-serif;
  }

  /* vue-slider-component */

  /* process style */
  .vue-slider-process {
    background-color: #1e88e5;
    border-radius: 15px;
  }

  /* mark style */
  .vue-slider-mark-label {
    top: -80%;
    font-size: 14px;
    white-space: nowrap;
  }

  .vue-slider-mark-step {
    visibility: hidden;
  }

  /* vue-slider-component */
</style>
