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
      // eslint-disable-next-line vue/no-unused-properties
      init(data) {
        this.$refs[this.steps[this.step]].init(data);
      },
      // eslint-disable-next-line vue/no-unused-properties
      back(data) {
        this.$refs[this.steps[this.step]].back(data);
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.$refs[this.steps[this.step]].getData();
      },
      // eslint-disable-next-line vue/no-unused-properties
      getExtend() {
        return this.$refs[this.steps[this.step]].getExtend();
      },
      refresh(data) {
        this.$emit('refresh', data);
      },
    },
  };
</script>
