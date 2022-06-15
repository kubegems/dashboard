<template>
  <BaseDialog v-model="dialog" icon="mdi-chart-areaspline" title="创建监控大盘" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addDashboard"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import DashboardBaseForm from './DashboardBaseForm';
  import { postAddMonitorDashboard } from '@/api';

  export default {
    name: 'AddDashboard',
    components: {
      DashboardBaseForm,
    },
    props: {
      environment: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        dialog: false,
        formComponent: 'DashboardBaseForm',
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addDashboard() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'DashboardBaseForm') {
            data = this.$refs[this.formComponent].getData();
          }
          await postAddMonitorDashboard(this.environment.value, data);
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
