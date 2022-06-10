<template>
  <BaseDialog v-model="dialog" :width="1000" title="创建istio服务入口" icon="mdi-login-variant" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="ServiceEntry" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addIstioServiceEntry"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { postAddIstioServiceEntry } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IstioServiceEntrySchema from '@/views/microservice/istio/service_entry/mixins/schema';

  export default {
    name: 'AddServiceEntry',
    mixins: [BaseResource, IstioServiceEntrySchema],
    data: () => ({
      dialog: false,
      formComponent: 'BaseYamlForm',
    }),
    computed: {
      ...mapState(['Circular', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addIstioServiceEntry() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
            if (!this.m_resource_checkDataWithOutNS(data)) return;
            data = this.m_resource_beautifyData(data);
          }
          await postAddIstioServiceEntry(
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
      },
    },
  };
</script>
