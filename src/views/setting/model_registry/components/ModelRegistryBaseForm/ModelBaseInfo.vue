<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型商店定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field class="my-0" label="商店名称" :readonly="edit" required />
        </v-col>
        <v-col cols="6">
          <v-text-field class="my-0" label="商店地址" required />
        </v-col>
        <v-col cols="6">
          <v-autocomplete label="默认镜像" />
        </v-col>
        <v-col cols="6">
          <v-switch class="mt-6" label="允许模型创建" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  export default {
    name: 'ModelBaseInfo',
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
