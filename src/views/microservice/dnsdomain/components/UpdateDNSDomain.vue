<template>
  <BaseDialog v-model="dialog" icon="mdi-dns" title="更新DNS" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateDNSDomain"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import DNSDomainBaseForm from './DNSDomainBaseForm';

  import { putUpdateDNSDomain, getDnsDomainDetail } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'UpdateDNSDomain',
    components: {
      DNSDomainBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      formComponent: 'DNSDomainBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async updateDNSDomain() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateDNSDomain(data.ID, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        const data = await getDnsDomainDetail(item.ID);
        this.$refs.DNSDomainBaseForm.setData({
          ...data,
          VirtualDomainID: data.ID,
        });
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
