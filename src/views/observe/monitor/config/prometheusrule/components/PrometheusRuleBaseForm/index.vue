<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <component :is="steps[step]" :ref="steps[step]" :item="item" :edit="edit" :mode="mode" :expr="expr" />
  </v-form>
</template>

<script>
  import Rule from './Rule';
  import Receiver from './Receiver';

  export default {
    name: 'PrometheusRuleBaseForm',
    components: {
      Rule,
      Receiver,
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
      mode: {
        type: String,
        default: () => 'monitor',
      },
      expr: {
        type: String,
        default: () => '',
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
