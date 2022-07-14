<template>
  <component :is="steps[step]" :ref="steps[step]" :control="control" :edit="edit" :item="item" @refresh="refresh" />
</template>

<script>
  import InitClusterConfig from './InitClusterConfig';
  import TestKubeConfig from './TestKubeConfig';
  import ValidateKubeConfig from './ValidateKubeConfig';

  export default {
    name: 'ClusterBaseForm',
    components: {
      InitClusterConfig,
      TestKubeConfig,
      ValidateKubeConfig,
    },
    props: {
      control: {
        type: Boolean,
        default: () => false,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      steps: ['ValidateKubeConfig', 'TestKubeConfig', 'InitClusterConfig'],
    }),
    methods: {
      init(data) {
        this.$refs[this.steps[this.step]].init(data);
      },
      back(data) {
        this.$refs[this.steps[this.step]].back(data);
      },
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      getData() {
        return this.$refs[this.steps[this.step]].getData();
      },
      getExtend() {
        return this.$refs[this.steps[this.step]].getExtend();
      },
      refresh(data) {
        this.$emit('refresh', data);
      },
    },
  };
</script>
