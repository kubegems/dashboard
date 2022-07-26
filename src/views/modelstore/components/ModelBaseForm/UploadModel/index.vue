<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型上传" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-file-input chips color="primary" counter label="模型文件" multiple show-size />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  export default {
    name: 'UploadModel',
    data() {
      return {
        valid: false,
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
