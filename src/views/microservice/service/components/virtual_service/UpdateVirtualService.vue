<template>
  <BaseDialog v-model="dialog" :width="1000" title="更新istio虚拟服务" icon="mdi-cloud-outline" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" :edit="true" title="VirtualService" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="updateIstioVirtualService">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { patchUpdateIstioVirtualService, getIstioVirtualServiceDetail } from '@/api';
  import IstioVirtualServiceBaseForm from './IstioVirtualServiceBaseForm';
  import BaseResource from '@/mixins/resource';
  import IstioVirtualServiceSchema from '@/views/microservice/service/mixins/schema';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateIstioVirtualService',
    components: {
      IstioVirtualServiceBaseForm,
    },
    mixins: [BaseResource, IstioVirtualServiceSchema],
    data: () => ({
      dialog: false,
      yaml: null,
      item: null,
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
      async updateIstioVirtualService() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithOutNS(data)) return;
            if (!this.m_resource_validateJsonSchema(this.virtualserviceschema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'IstioVirtualServiceBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await patchUpdateIstioVirtualService(
            this.EnvironmentFilter.cluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        const data = await getIstioVirtualServiceDetail(this.EnvironmentFilter.cluster, item.namespace, item.name);
        this.item = deepCopy(data);
        this.$refs[this.formComponent].setYaml(deepCopy(data));
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
