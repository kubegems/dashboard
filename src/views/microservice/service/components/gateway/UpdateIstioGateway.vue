<template>
  <BaseDialog v-model="dialog" icon="mdi-gate" title="更新istio网关" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="Gateway" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateIstioGateway"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import IstioGatewayBaseForm from './IstioGatewayBaseForm';
  import { getIstioGatewayDetail, patchUpdateIstioGateway } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import IstioGatewaySchema from '@/views/microservice/service/mixins/schema';

  export default {
    name: 'UpdateGateway',
    components: {
      IstioGatewayBaseForm,
    },
    mixins: [BaseResource, IstioGatewaySchema],
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
      open() {
        this.dialog = true;
      },
      async updateIstioGateway() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithOutNS(data)) return;
            if (!this.m_resource_validateJsonSchema(this.gatewayschema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'IstioGatewayBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await patchUpdateIstioGateway(
            this.EnvironmentFilter.cluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getIstioGatewayDetail(this.EnvironmentFilter.cluster, item.namespace, item.name);
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
