<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="保存快照"
    icon="mdi-content-save"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="快照定义" />
      <v-card-text class="pa-2">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="obj.SnapshotName"
            :rules="objRules.SnapshotNameRules"
            label="快照名称"
          />
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addLogQuerySnapshot"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddLogQuerySnapshot } from '@/api'

export default {
  name: 'SaveLogSnapshot',
  data: () => ({
    dialog: false,
    valid: false,
    obj: {
      SnapshotName: '',
      SourceFile: '',
    },
    objRules: {
      SnapshotNameRules: [(v) => !!v || '名称必填'],
    },
    item: {},
    currentCluster: {},
  }),
  computed: {
    ...mapState(['Circular', 'Progress', 'User']),
    ...mapGetters(['Cluster']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addLogQuerySnapshot() {
      if (this.Progress) return
      if (this.$refs.form.validate()) {
        await postAddLogQuerySnapshot(
          Object.assign(this.item, {
            SnapshotName: this.obj.SnapshotName,
            SourceFile: this.obj.SourceFile,
            CreateAt: new Date(),
            CreatorID: this.User.ID,
            ClusterName: this.currentCluster.text,
            ClusterID: this.currentCluster.value,
          }),
        )
      }
      this.reset()
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
