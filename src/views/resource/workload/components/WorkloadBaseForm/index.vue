<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component :is="steps[step]" :ref="steps[step]" :edit="edit" :item="item" :kind="kind" />
  </v-form>
</template>

<script>
  import ContaninerImage from './ContainerImage';
  import DeployPolicy from './DeployPolicy';
  import ScheduleSelector from './ScheduleSelector';
  import StorageMount from './StorageMount';
  import WorkloadBaseInfo from './WorkloadBaseInfo';

  export default {
    name: 'WorkloadBaseForm',
    components: {
      ContaninerImage,
      DeployPolicy,
      ScheduleSelector,
      StorageMount,
      WorkloadBaseInfo,
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
