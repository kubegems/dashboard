<template>
  <BaseDialog v-model="dialog" icon="mdi-key" title="更新istio认证策略" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="AuthorizationPolicy" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateIstioAuthorizationPolicy">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchUpdateIstioAuthorizationPolicy, getIstioAuthorizationPolicyDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import IstioAuthorizationPolicySchema from '@/views/microservice/istio/authorization_policy/mixins/schema';

  export default {
    name: 'UpdateIstioAuthorizationPolicy',
    mixins: [BaseResource, IstioAuthorizationPolicySchema],
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
      async updateIstioAuthorizationPolicy() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithOutNS(data)) return;
            data = this.m_resource_beautifyData(data);
          }
          await patchUpdateIstioAuthorizationPolicy(
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
        const data = await getIstioAuthorizationPolicyDetail(
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
