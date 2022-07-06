<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field class="my-0" label="模型名称" :readonly="edit" required />
        </v-col>
        <v-col cols="6">
          <v-autocomplete label="类型" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete label="Libraries" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete label="License" />
        </v-col>
        <v-col cols="12">
          <v-textarea auto-grow label="模型简介" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  export default {
    name: 'ModelInfo',
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
    },
    data() {
      return {
        valid: false,
        // obj: {},
        // objRules: {},
      };
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
