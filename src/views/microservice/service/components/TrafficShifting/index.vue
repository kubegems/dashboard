<template>
  <BaseDialog v-model="dialog" icon="mdi-recycle" title="流量切换" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :service="service" title="TrafficShifting" :vs="vs" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTrafficShifting"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import TrafficShiftingBaseForm from './TrafficShiftingBaseForm';
  import { postAddTrafficShifting } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'TrafficShifting',
    components: {
      TrafficShiftingBaseForm,
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
      formComponent: 'TrafficShiftingBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTrafficShifting() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'TrafficShiftingBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await postAddTrafficShifting(
            this.VirtualSpace().ID,
            this.$route.query.environmentid,
            this.$route.params.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      init() {
        this.formComponent = 'TrafficShiftingBaseForm';
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
