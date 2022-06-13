<template>
  <BaseDialog v-model="dialog" icon="mdi-cloud-outline" title="创建istio虚拟服务" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="VirtualService" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addIstioVirtualService"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import IstioVirtualServiceBaseForm from './IstioVirtualServiceBaseForm';

  import { postAddIstioVirtualService } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IstioVirtualServiceSchema from '@/views/microservice/service/mixins/schema';

  export default {
    name: 'AddIstioVirtualService',
    components: {
      IstioVirtualServiceBaseForm,
    },
    mixins: [BaseResource, IstioVirtualServiceSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'BaseYamlForm',
    }),
    computed: {
      ...mapState(['Circular', 'EnvironmentFilter']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addIstioVirtualService() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_validateJsonSchema(this.virtualserviceschema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'IstioVirtualServiceBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          if (!this.m_resource_checkDataWithOutNS(data)) return;
          await postAddIstioVirtualService(
            this.EnvironmentFilter.cluster,
            this.EnvironmentFilter.namespace,
            data.metadata.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'BaseYamlForm';
        this.yaml = false;
      },
    },
  };
</script>
