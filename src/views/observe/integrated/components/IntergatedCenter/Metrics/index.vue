<template>
  <div class="pt-4">
    <component :is="formComponent" :ref="formComponent" :v="v" @close="close" />
  </div>
</template>

<script>
  import MetricsBaseForm from './MetricsBaseForm';
  import MetricsDocs from './MetricsDocs';

  export default {
    name: 'Metrics',
    components: {
      MetricsBaseForm,
      MetricsDocs,
    },
    props: {
      v: {
        type: String,
        default: () => '',
      },
      component: {
        type: String,
        default: () => 'MetricsDocs',
      },
    },
    data() {
      return {
        formComponent: 'MetricsDocs',
      };
    },
    watch: {
      component: {
        handler(newValue) {
          if (newValue) {
            this.formComponent = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      switchComponent() {
        this.formComponent = this.formComponent === 'MetricsBaseForm' ? 'MetricsDocs' : 'MetricsBaseForm';
      },
      async addData() {
        this.$refs[this.formComponent].addData();
      },
      close() {
        this.$emit('close');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .metrics {
    &__fab {
      margin-bottom: 55px;
      height: 45px;
      width: 45px;
      border-radius: 45px;
      right: 20px;
    }
  }
</style>
