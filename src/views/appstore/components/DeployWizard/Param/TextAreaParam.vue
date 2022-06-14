<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-textarea
      :id="id"
      auto-grow
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :rules="textareaRule"
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
        textareaRule: [required],
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
      onChange(event) {
        this.$emit('changeBasicFormParam', this.param, event);
      },
    },
  };
</script>
