<template>
  <BaseDialog v-model="dialog" :width="1000" title="更新istio网关" icon="mdi-network" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" :edit="true" title="Gateway" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="updateIstioGateway"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { patchUpdateIstioGateway, getIstioGatewayDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IstioGatewaySchema from '@/views/microservice/istio/gateway/mixins/schema';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateGateway',
    mixins: [BaseResource, IstioGatewaySchema],
    data: () => ({
      dialog: false,
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
      async updateIstioGateway() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithOutNS(data)) return;
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
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        const data = await getIstioGatewayDetail(
          this.EnvironmentFilter.cluster,
          item.metadata.namespace,
          item.metadata.name,
        );
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'BaseYamlForm';
      },
    },
  };
</script>
