<template>
  <BaseDialog
    v-model="dialog"
    icon="mdi-file-powerpoint-box"
    title="创建 Prometheus 查询模版"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" title="Reocrding Rules" :units="units" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTemplate"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import TemplateBaseForm from './TemplateBaseForm';

  import { postPrometheusTemplate } from '@/api';

  export default {
    name: 'AddTemplate',
    components: {
      TemplateBaseForm,
    },
    props: {
      units: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      dialog: false,
      yaml: null,
      item: null,
      resourceName: null,
      formComponent: 'TemplateBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addTemplate() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'TemplateBaseForm') {
            data = this.$refs[this.formComponent].getData();
            const ruleName = data.name;
            delete data.name;
            await postPrometheusTemplate(this.resourceName, ruleName, data);
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(resourceName) {
        this.resourceName = resourceName;
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'TemplateBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
