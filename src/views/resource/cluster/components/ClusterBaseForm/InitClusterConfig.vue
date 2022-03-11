<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <BaseSubTitle title="集群初始化设置" />
    <v-card-text
      class="pa-2"
    >
      <v-row>
        <v-col
          v-if="!control && !edit && obj.extend.existInstaller"
          cols="12"
        >
          <v-switch
            v-model="obj.Primary"
            class="mt-5"
            label="控制集群"
            @change="onPrimaryChange"
          />
        </v-col>
        <v-col
          v-if="!obj.Primary"
          cols="6"
        >
          <v-text-field
            v-model="obj.ClusterName"
            required
            label="集群名称"
            :rules="objRules.ClusterNameRules"
            :readonly="edit"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.ImageRepo"
            required
            label="默认仓库地址"
            :rules="objRules.ImageRepoRules"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.DefaultStorageClass"
            :items="storageClassItems"
            :rules="objRules.StorageClassesRules"
            color="primary"
            label="默认存储类型"
            hide-selected
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'InitClusterConfig',
  props: {
    edit: {
      type: Boolean,
      default: () => false,
    },
    control: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    obj: {
      ClusterID: 0,
      ClusterName: '',
      KubeConfig: '',
      Primary: false,
      Vendor: 'selfhosted',
      ImageRepo: 'docker.io/kubegems',
      DefaultStorageClass: '',
      extend: {
        storageClasses: [],
        validate: 'progressing',
        clusterName: '',
        existInstaller: false,
      },
    },
    objRules: {
      ClusterNameRules: [required],
      ImageRepoRules: [required],
      StorageClassesRules: [required],
    },
  }),
  computed: {
    storageClassItems() {
      return this.obj.extend.storageClasses.map(sc => { return { value: sc, text: sc } })
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    getExtend() {
      return this.obj.extend
    },
    async onPrimaryChange() {
      if (this.obj.Primary) {
        this.obj.ClusterName = this.obj.extend.clusterName
      } else {
        this.obj.ClusterName = ''
      }
    },
  },
}
</script>

