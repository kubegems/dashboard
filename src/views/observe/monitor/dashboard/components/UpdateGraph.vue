<template>
  <BaseDialog v-model="dialog" icon="mdi-chart-areaspline" title="更新监控图" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :environment="environment" :item="item" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateGraph"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import GraphBaseForm from './GraphBaseForm';
  import { putUpdateMonitorDashboard } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateDashboard',
    components: {
      GraphBaseForm,
    },
    props: {
      dashboard: {
        type: Object,
        default: () => null,
      },
      environment: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        dialog: false,
        formComponent: 'GraphBaseForm',
        index: 0,
        item: null,
        dashboardCopy: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    watch: {
      dashboard: {
        handler(newValue) {
          if (newValue) {
            this.dashboardCopy = deepCopy(newValue);
          }
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item, index) {
        this.index = index;
        this.item = deepCopy(item);
      },
      async updateGraph() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'GraphBaseForm') {
            data = this.$refs[this.formComponent].getData();
            this.dashboardCopy.graphs[this.index] = data;
          }
          await putUpdateMonitorDashboard(this.environment.value, this.dashboardCopy.id, this.dashboardCopy);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.index = 0;
      },
    },
  };
</script>
