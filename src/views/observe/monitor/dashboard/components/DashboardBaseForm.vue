<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <BaseSubTitle title="大盘定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="obj.name"
            class="my-0"
            label="名称"
            :readonly="edit"
            required
            :rules="objRules.nameRule"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'DashboardBaseForm',
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          name: '',
        },
        objRules: {
          nameRule: [required],
        },
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
          }
        },
        deep: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
