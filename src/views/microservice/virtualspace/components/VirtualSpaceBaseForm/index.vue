<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component :is="steps[step]" :ref="steps[step]" :edit="edit" :item="item" @refresh="refresh" />
  </v-form>
</template>

<script>
  import LinkEnvironment from './LinkEnvironment';
  import ManageUserForm from './ManageUserForm';
  import VirtualSpaceBaseInfo from './VirtualSpaceBaseInfo';

  export default {
    name: 'VirtualSpaceBaseForm',
    components: {
      LinkEnvironment,
      ManageUserForm,
      VirtualSpaceBaseInfo,
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
      steps: ['VirtualSpaceBaseInfo', 'LinkEnvironment', 'ManageUserForm'],
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
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      refresh() {
        this.$emit('refresh');
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
    },
  };
</script>
