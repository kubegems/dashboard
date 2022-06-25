<template>
  <div class="pt-4">
    <v-btn bottom class="metrics__fab" color="primary" dark fab fixed right small @click="switchComponent">
      <v-icon small> {{ formComponent === 'MetricsBaseForm' ? 'fas fa-book' : 'fas fa-link' }} </v-icon>
    </v-btn>
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
    },
    data() {
      return {
        formComponent: 'MetricsDocs',
      };
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
