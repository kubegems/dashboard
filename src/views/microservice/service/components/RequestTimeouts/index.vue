<template>
  <BaseDialog v-model="dialog" icon="mdi-clock" title="请求超时" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :service="service" title="RequestTimeouts" :vs="vs" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addRequestTimeouts"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RequestTimeoutsBaseForm from './RequestTimeoutsBaseForm';

  import { postAddRequestTimeouts } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'RequestTimeouts',
    components: {
      RequestTimeoutsBaseForm,
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
      formComponent: 'RequestTimeoutsBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addRequestTimeouts() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'RequestTimeoutsBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await postAddRequestTimeouts(
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
        this.formComponent = 'RequestTimeoutsBaseForm';
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
