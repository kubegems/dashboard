<template>
  <v-flex>
    <BaseSubTitle :title="title" />
    <v-form ref="form" v-model="valid" lazy-validation class="mt-2 rounded-t mx-2" @submit.prevent />
    <div class="px-2">
      <ACEEditor
        v-model="kubeyaml"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
        lang="yaml"
        :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
        theme="chrome"
        height="600"
        @init="$aceinit"
        @keydown.stop
      />
    </div>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseYamlForm',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      valid: false,
      kubeyaml: '',
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.kubeyaml = this.$yamldump(this.item);
      },
    },
    mounted() {
      if (this.item) this.kubeyaml = this.$yamldump(this.item);
    },
    methods: {
      init() {},
      validate() {
        return this.$refs.form.validate(true);
      },
      checkSaved() {
        return true;
      },
      reset() {
        this.kubeyaml = '';
        this.$refs.form.reset();
      },
      setYaml(data) {
        this.kubeyaml = data;
      },
      getYaml() {
        return this.kubeyaml;
      },
    },
  };
</script>
