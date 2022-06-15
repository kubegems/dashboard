<template>
  <BaseDialog v-model="dialog" icon="mdi-dns" title="创建DNS" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addDNSDomain"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import DNSDomainBaseForm from './DNSDomainBaseForm';

  import { postAddDNSDomain } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddDNSDomain',
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
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addDNSDomain() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await postAddDNSDomain(data);
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
