<template>
  <BaseDialog v-model="dialog" :width="1000" title="故障注入" icon="mdi-eyedropper" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :service="service" :vs="vs" title="FaultInjection" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addFaultInjection"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import FaultInjectionBaseForm from './FaultInjectionBaseForm';
  import { postAddFaultInjection } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'FaultInjection',
    components: {
      FaultInjectionBaseForm,
    },
    mixins: [BaseResource],
    props: {
      service: {
        type: Object,
        default: () => null,
      },
      vs: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'FaultInjectionBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addFaultInjection() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'FaultInjectionBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await postAddFaultInjection(
            this.VirtualSpace().ID,
            this.$route.query.environmentid,
            this.$route.params.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      init() {
        this.formComponent = 'FaultInjectionBaseForm';
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = '';
        this.yaml = false;
      },
    },
  };
</script>
