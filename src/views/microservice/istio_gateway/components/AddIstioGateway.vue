<template>
  <BaseDialog v-model="dialog" icon="mdi-gateway" title="创建网关实例" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addIstioGatewayInstance">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import IstioGatewayBaseForm from './IstioGatewayBaseForm';

  import { postAddIstioGatewayInstance } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddIstioGateway',
    components: {
      IstioGatewayBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      formComponent: 'IstioGatewayBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addIstioGatewayInstance() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await postAddIstioGatewayInstance(this.VirtualSpace().ID, this.$route.query.clusterid, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
