<template>
  <BaseDialog v-model="dialog" icon="mdi-camera" title="快照恢复" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="存储卷定义" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="item.metadata.name" class="my-0" label="快照" readonly />
            <v-text-field v-model="obj.name" class="my-0" label="存储卷名称" required :rules="objRules.nameRules" />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="restoreVolumeSnapshot"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postRestoreVolumeSnapshot } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'RestoreVolumeSnapshot',
    mixins: [BaseResource, BaseSelect],
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
          nameRules: [required, k8sName],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item) {
        this.item = deepCopy(item);
      },
      async restoreVolumeSnapshot() {
        if (this.$refs.form.validate(true)) {
          await postRestoreVolumeSnapshot(this.ThisCluster, this.item.metadata.namespace, {
            name: this.obj.name,
            volumeSnapshotName: this.item.metadata.name,
          });
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
