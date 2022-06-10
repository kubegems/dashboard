<template>
  <BaseDialog v-model="dialog" :width="500" :title="title" icon="mdi-hexagon-multiple" @reset="reset">
    <template #content>
      <BaseSubTitle title="仓库定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.ChartRepoName"
              class="my-0"
              :rules="objRules.chartRepoNameRules"
              required
              label="名称"
            />
            <v-text-field
              v-model="obj.URL"
              class="my-0 kubegems__long-width"
              :rules="objRules.urlRules"
              required
              label="URL"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="recreateRepository"> 确定 </v-btn>
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
      // eslint-disable-next-line vue/no-unused-properties
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
      // 更新使用
      // eslint-disable-next-line vue/no-unused-properties
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      setTitle(data) {
        this.title = data;
      },
    },
  };
</script>
