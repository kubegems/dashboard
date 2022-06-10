<template>
  <div class="left-steps">
    <v-stepper v-model="current" vertical class="pb-0">
      <template v-for="(item, index) in steps">
        <v-stepper-step
          :key="item.id"
          :complete="current > index + 1"
          :step="index + 1"
          editable
          edit-icon="mdi-check"
          complete-icon="mdi-check"
        >
          <span class="kubegems__text">{{ item.name }}</span>
          <small class="mt-2" style="font-size: 1rem">
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
          id: 'install',
          name: '与KubeGems Monitoring 集成',
          desc: '安装代理或集成 Prometheus SDK',
        },
        {
          id: 'collect',
          name: '创建日志采集器',
          desc: '收集日志指标',
        },
        {
          id: 'analyze',
          name: '创建日志分析',
          desc: '直观的分析应用运行指标以及追踪告警',
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
