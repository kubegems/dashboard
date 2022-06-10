<template>
  <BaseDialog v-model="dialog" :width="500" title="创建监控大盘" icon="mdi-chart-areaspline" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addDashboard"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { postAddMonitorDashboard } from '@/api';
  import DashboardBaseForm from './DashboardBaseForm';

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
      // eslint-disable-next-line vue/no-unused-properties
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
