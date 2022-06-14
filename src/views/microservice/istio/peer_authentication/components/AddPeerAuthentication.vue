<template>
  <BaseDialog v-model="dialog" icon="mdi-vector-point" title="创建istio端点认证" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="PeerAuthentication" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addIstioPeerAuthentication">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { postAddIstioPeerAuthentication } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IstioAuthorizationPolicySchema from '@/views/microservice/istio/peer_authentication/mixins/schema';

  export default {
    name: 'AddPeerAuthentication',
    mixins: [BaseResource, IstioAuthorizationPolicySchema],
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
      async addIstioPeerAuthentication() {
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
          await postAddIstioPeerAuthentication(
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
