<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-text-field
      :id="id"
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :rules="textRule"
      :type="inputType ? inputType : 'text'"
      :value="param.value"
      @change="onChange($event)"
    />
  </v-flex>
</template>

<script>
  import { required } from '@/utils/rules';

  export default {
    name: 'TextFieldParam',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      inputType: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        textRule: [required],
      };
    },
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    mounted() {
      this.onChange(this.param.value);
    },
    methods: {
      onChange(value) {
        if (this.inputType === 'number' && value) {
          value = parseFloat(value, 10);
        }
        if (value) {
          this.$emit('changeBasicFormParam', this.param, value);
        }
      },
    },
  };
</script>
