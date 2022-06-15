<template>
  <BaseDialog v-model="dialog" icon="mdi-source-branch" title="请求路由" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :service="service" title="RequestRouting" :vs="vs" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addRequestRouting"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RequestRoutingBaseForm from './RequestRoutingBaseForm';

  import { postAddRequestRouting } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'RequestRouting',
    components: {
      RequestRoutingBaseForm,
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
      formComponent: 'RequestRoutingBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addRequestRouting() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'RequestRoutingBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await postAddRequestRouting(
            this.VirtualSpace().ID,
            this.$route.query.environmentid,
            this.$route.params.name,
            [data],
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      init() {
        this.formComponent = 'RequestRoutingBaseForm';
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
