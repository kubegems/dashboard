<template>
  <BaseDialog v-model="dialog" icon="mdi-motorbike" title="更新istio边车" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="Sidecar" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateIstioSidecar"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { getIstioSidecarDetail, patchUpdateIstioSidecar } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import IstioSidecarSchema from '@/views/microservice/istio/sidecar/mixins/schema';

  export default {
    name: 'UpdateSidecar',
    mixins: [BaseResource, IstioSidecarSchema],
    data: () => ({
      dialog: false,
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
      async updateIstioSidecar() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithOutNS(data)) return;
            data = this.m_resource_beautifyData(data);
          }
          await patchUpdateIstioSidecar(
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
        const data = await getIstioSidecarDetail(
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
