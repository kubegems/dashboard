<template>
  <BaseDialog v-model="dialog" icon="mdi-call-received" title="更新接收器" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="Receiver" />
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="Circular" text @click="updateReceiver"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ReceiverBaseForm from './ReceiverBaseForm';
  import { putUpdateReceiver } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateReceiver',
    components: {
      ReceiverBaseForm,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'ReceiverBaseForm',
      item: {},
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(item) {
        this.item = deepCopy(item);
      },
      async updateReceiver() {
        if (this.$refs[this.formComponent].validate()) {
          let data = this.$refs[this.formComponent].getData();
          data = this.m_resource_beautifyData(data);
          await putUpdateReceiver(this.$route.query.cluster, this.$route.query.namespace, data.name, data);

          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'ReceiverBaseForm';
      },
    },
  };
</script>
