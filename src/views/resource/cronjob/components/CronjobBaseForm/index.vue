<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component :is="steps[step]" :ref="steps[step]" :edit="edit" :item="item" :kind="kind" />
  </v-form>
</template>

<script>
  import ContaninerImage from './ContainerImage';
  import CronJobBaseInfo from './CronJobBaseInfo';
  import StorageMount from './StorageMount';
  import ScheduleSelector from '@/views/resource/workload/components/WorkloadBaseForm/ScheduleSelector';

  export default {
    name: 'CronjobBaseForm',
    components: {
      ContaninerImage,
      CronJobBaseInfo,
      ScheduleSelector,
      StorageMount,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      steps: ['CronJobBaseInfo', 'ContaninerImage', 'StorageMount', 'ScheduleSelector'],
    }),
    computed: {
      obj() {
        return this.$refs[this.steps[this.step]].getData();
      },
    },
    methods: {
      init(data) {
        this.$refs[this.steps[this.step]].init(data);
      },
      back(data) {
        this.$refs[this.steps[this.step]].back(data);
      },
      checkSaved() {
        return this.$refs[this.steps[this.step]].checkSaved();
      },
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
