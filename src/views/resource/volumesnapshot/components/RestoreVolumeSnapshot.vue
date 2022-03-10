<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="快照恢复"
    icon="mdi-camera"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="存储卷定义" />
      <v-card-text class="px-2 pb-0">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent
        >
          <v-sheet>
            <v-text-field
              v-model="item.metadata.name"
              class="my-0"
              label="快照"
              readonly
            />
            <v-text-field
              v-model="obj.name"
              class="my-0"
              required
              label="存储卷名称"
              :rules="objRules.nameRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="restoreVolumeSnapshot"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postRestoreVolumeSnapshot } from '@/api'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'RestoreVolumeSnapshot',
  mixins: [BaseSelect, BaseResource],
  data: () => ({
    dialog: false,
    valid: false,
    item: { metadata: { name: '' } },
    obj: {
      name: '',
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        nameRules: [
          required,
          k8sName,
        ],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item) {
      this.item = deepCopy(item)
    },
    async restoreVolumeSnapshot() {
      if (this.$refs.form.validate(true)) {
        await postRestoreVolumeSnapshot(
          this.ThisCluster,
          this.item.metadata.namespace,
          {
            name: this.obj.name,
            volumeSnapshotName: this.item.metadata.name,
          },
        )
        this.reset()
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
