<template>
  <BaseDialog v-model="dialog" icon="mdi-key" title="创建istio认证策略" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="AuthorizationPolicy" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addIstioAuthorizationPolicy">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { postAddIstioAuthorizationPolicy } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IstioAuthorizationPolicySchema from '@/views/microservice/istio/authorization_policy/mixins/schema';

  export default {
    name: 'AddIstioAuthorizationPolicy',
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
      async addIstioAuthorizationPolicy() {
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
          await postAddIstioAuthorizationPolicy(
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
