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
  <div class="left-steps">
    <v-stepper v-model="current" class="pb-0" vertical>
      <template v-for="(item, index) in steps">
        <v-stepper-step
          :key="item.id"
          :complete="current > index + 1"
          complete-icon="mdi-check"
          edit-icon="mdi-check"
          editable
          :step="index + 1"
        >
          <span class="kubegems__text">{{ item.name }}</span>
          <small class="mt-2 text-body-2">
            {{ item.desc }}
          </small>
        </v-stepper-step>
        <v-stepper-content :key="`${item.id}Content`" :step="index + 1" />
      </template>
    </v-stepper>
  </div>
</template>

<script>
  export default {
    name: 'LeftSteps',
    props: {
      value: {
        type: String,
        default: undefined,
      },
    },
    data() {
      this.steps = [
        {
          id: 'metrics',
          name: '安装 OpenTelemetry Metrics Library',
          desc: '自定义指标可以深入了解应用实时状态,以及发现它如何影响用户体验或者业务流程',
        },
        {
          id: 'traces',
          name: '安装 OpenTelemetry Traces Library',
          desc: '链路追踪Tracing提供了调用链路还原、链路拓扑、应用依赖分析等工具,可帮助开发者快速分析和诊断应用的性能瓶颈,提高开发诊断效率',
        },
        {
          id: 'logs',
          name: '创建采集器收集应用日志',
          desc: '自动采集应用容器控制台(stdout/stderr)日志,可帮助开发者在故障时进行日志分析',
        },
      ];

      return {
        current: 1,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.current = this.steps.findIndex((item) => item.id === newValue) + 1 || 1;
        },
        immediate: true,
      },
      current(newValue) {
        const id = this.steps[newValue - 1].id;
        this.$emit('input', id);
        this.$emit('change', id);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-application--is-ltr .v-stepper--vertical .v-stepper__content {
    margin: -8px -36px -21px 36px !important;
  }

  .step {
    &__font {
      font-size: 14px;
      line-height: 18px;
    }
  }
</style>
