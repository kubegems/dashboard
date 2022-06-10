<template>
  <BaseDialog v-model="visible" :width="500" title="保存快照" icon="mdi-content-save" @reset="reset">
    <template #content>
      <BaseSubTitle title="快照定义" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-text-field v-model="snapshotName" :rules="objRules.SnapshotNameRules" label="快照名称" />
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="handleSaveSnapshot"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { postAddLogQuerySnapshot } from '@/api';

  export default {
    name: 'LogSaveSnapshot',
    data: () => ({
      visible: false,
      valid: false,
      snapshotName: '',
      objRules: {
        SnapshotNameRules: [(v) => !!v || '名称必填'],
      },
    }),
    computed: {
      ...mapState(['Circular', 'Progress', 'User']),
      ...mapGetters(['Cluster']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      show(params) {
        if (this.Progress) return;
        this.visible = true;
        this.params = params;
      },
      async handleSaveSnapshot() {
        if (this.Progress) return;
        if (this.$refs.form.validate()) {
          await postAddLogQuerySnapshot({
            ...this.params,
            SnapshotName: this.snapshotName,
            CreateAt: new Date(),
            CreatorID: this.User.ID,
          });
        }
        this.reset();
      },
      reset() {
        this.visible = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
