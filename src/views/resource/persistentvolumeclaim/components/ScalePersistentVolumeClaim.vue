<template>
  <BaseDialog v-model="dialog" icon="fas fa-arrows-alt-v" title="扩容存储卷" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="扩容定义" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.metadata.name" class="my-0" label="存储卷" readonly />
            <v-flex class="text-subtitle-1 mb-2">
              当前容量
              <span class="text-subtitle-2 primary--text">
                {{ storage }}
              </span>
            </v-flex>
            <v-text-field
              v-model="obj.spec.resources.requests.storage"
              class="my-0"
              label="目标容量"
              required
              :rules="objRules.StorageRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updatePersistentVolumeClaim">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchUpdatePersistentVolumeClaim } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, sizeOfStorage } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ScalePersistentVolumeClaim',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      storage: '',
      obj: {
        metadata: { name: '' },
        spec: { resources: { requests: { storage: '' } } },
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          StorageRules: [
            required,
            (v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || '格式错误(示例:1Ki,1Mi,1Gi,1Ti)',
            (v) => !!(sizeOfStorage(v, 'Mi') >= sizeOfStorage(this.storage, 'Mi')) || '小于当前值',
          ],
        };
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(item) {
        this.storage = item.spec.resources.requests.storage;
        this.obj = deepCopy(item);
      },
      async updatePersistentVolumeClaim() {
        if (this.$refs.form.validate(true)) {
          await patchUpdatePersistentVolumeClaim(
            this.ThisCluster,
            this.obj.metadata.namespace,
            this.obj.metadata.name,
            this.obj,
          );
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
