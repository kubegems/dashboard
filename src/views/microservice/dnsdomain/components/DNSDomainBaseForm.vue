<template>
  <v-flex>
    <BaseSubTitle title="DNS定义" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-sheet>
          <v-text-field
            v-model="obj.VirtualDomainName"
            class="my-0"
            label="DNS"
            required
            :rules="objRules.virtualDomainNameRules"
          />
        </v-sheet>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import { required } from '@/utils/rules';

  export default {
    name: 'DNSDomainBaseForm',
    mixins: [BaseResource],
    data: () => ({
      valid: false,
      obj: {
        VirtualDomainName: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          virtualDomainNameRules: [required],
        };
      },
    },
    methods: {
      reset() {
        this.$refs.form.reset();
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      setData(data) {
        this.obj = data;
      },
    },
  };
</script>
