<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component :is="steps[step]" :ref="steps[step]" :edit="edit" :item="item" @refresh="refresh" />
  </v-form>
</template>

<script>
  import ModelInfo from './ModelInfo';
  import UploadModel from './UploadModel';

  export default {
    name: 'ModelBaseForm',
    components: {
      ModelInfo,
      UploadModel,
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
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      steps: ['ModelInfo', 'UploadModel'],
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
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      refresh() {
        this.$emit('refresh');
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
