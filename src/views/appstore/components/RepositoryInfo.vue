<template>
  <BaseDialog v-model="dialog" icon="mdi-hexagon-multiple" :title="title" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="应用商店定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.ChartRepoName"
              class="my-0"
              label="名称"
              required
              :rules="objRules.chartRepoNameRules"
            />
            <v-text-field
              v-model="obj.URL"
              class="my-0 kubegems__long-width"
              label="URL"
              required
              :rules="objRules.urlRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="recreateRepository"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postAddRepository } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'RepositoryInfo',
    mixins: [BaseSelect],
    data: () => ({
      title: '',
      dialog: false,
      valid: false,
      obj: {
        ChartRepoName: '',
        URL: '',
      },
      objRules: {
        chartRepoNameRules: [required],
        urlRules: [required],
      },
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async recreateRepository() {
        if (this.$refs.form.validate(true)) {
          await postAddRepository(this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      setTitle(data) {
        this.title = data;
      },
    },
  };
</script>
