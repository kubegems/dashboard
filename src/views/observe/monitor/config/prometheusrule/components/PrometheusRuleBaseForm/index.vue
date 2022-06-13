<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <component :is="steps[step]" :ref="steps[step]" :edit="edit" :expr="expr" :item="item" :mode="mode" />
  </v-form>
</template>

<script>
  import Receiver from './Receiver';
  import Rule from './Rule';

  export default {
    name: 'PrometheusRuleBaseForm',
    components: {
      Receiver,
      Rule,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      expr: {
        type: String,
        default: () => '',
      },
      item: {
        type: Object,
        default: () => null,
      },
      mode: {
        type: String,
        default: () => 'monitor',
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      steps: ['Rule', 'Receiver'],
    }),
    computed: {
      // eslint-disable-next-line vue/no-unused-properties
      obj() {
        return this.$refs[this.steps[this.step]].getData();
      },
    },
    watch: {
      item() {},
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
      // eslint-disable-next-line vue/no-unused-properties
      setData(data) {
        this.$refs[this.steps[this.step]].setData(data);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getInhibitLabels() {
        return this.$refs[this.steps[this.step]].getInhibitLabels();
      },
      // eslint-disable-next-line vue/no-unused-properties
      setLabelpairs(data) {
        this.$refs[this.steps[this.step]].setLabelpairs(data);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
    },
  };
</script>
