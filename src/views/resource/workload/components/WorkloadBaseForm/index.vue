<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component :is="steps[step]" :ref="steps[step]" :item="item" :edit="edit" :kind="kind" />
  </v-form>
</template>

<script>
  import WorkloadBaseInfo from './WorkloadBaseInfo';
  import ContaninerImage from './ContainerImage';
  import StorageMount from './StorageMount';
  import ScheduleSelector from './ScheduleSelector';
  import DeployPolicy from './DeployPolicy';

  export default {
    name: 'WorkloadBaseForm',
    components: {
      WorkloadBaseInfo,
      ContaninerImage,
      StorageMount,
      ScheduleSelector,
      DeployPolicy,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      step: {
        type: Number,
        default: () => 0,
      },
      kind: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      valid: false,
      steps: ['WorkloadBaseInfo', 'ContaninerImage', 'StorageMount', 'ScheduleSelector', 'DeployPolicy'],
    }),
    computed: {
      // eslint-disable-next-line vue/no-unused-properties
      obj() {
        return this.$refs[this.steps[this.step]].getData();
      },
    },
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
      checkSaved() {
        return this.$refs[this.steps[this.step]].checkSaved();
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
        return this.obj;
      },
    },
  };
</script>
