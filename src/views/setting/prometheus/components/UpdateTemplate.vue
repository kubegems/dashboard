<template>
  <BaseDialog
    v-model="dialog"
    icon="mdi-file-powerpoint-box"
    title="更新 Prometheus 查询模版"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :item="item"
        title="Reocrding Rules"
        :units="units"
      />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateTemplate"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import TemplateBaseForm from './TemplateBaseForm';

  import { postPrometheusTemplate } from '@/api';

  export default {
    name: 'UpdateTemplate',
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
      open() {
        this.dialog = true;
      },
      async updateTemplate() {
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
      init(resourceName, item) {
        this.item = item;
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
