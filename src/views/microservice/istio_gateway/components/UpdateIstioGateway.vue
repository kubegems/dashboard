<template>
  <BaseDialog v-model="dialog" icon="mdi-gate" title="更新网关实例" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateIstioGatewayInstance">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import IstioGatewayBaseForm from './IstioGatewayBaseForm';
  import { putUpdateIstioGatewayInstance, getIstioGatewayInstanceDetail } from '@/api';

  export default {
    name: 'UpdateIstioGateway',
    components: {
      IstioGatewayBaseForm,
    },
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
      async updateIstioGatewayInstance() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateIstioGatewayInstance(this.VirtualSpace().ID, this.$route.query.clusterid, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getIstioGatewayInstanceDetail(
          this.VirtualSpace().ID,
          this.$route.query.clusterid,
          item.Name,
        );
        this.$refs[this.formComponent].setData(data);
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
