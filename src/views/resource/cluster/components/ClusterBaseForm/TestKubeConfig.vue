<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <BaseSubTitle title="测试集群" />
    <v-card-text
      v-if="Circular"
      class="py-6 px-2 mt-2"
      style="width: 500px; margin: auto;"
    >
      <v-progress-linear
        indeterminate
        color="green"
        stream
        buffer-value="0"
        rounded
        height="10"
      />
    </v-card-text>
    <v-card-text>
      <v-flex
        class="text-subtitle-1 text-center"
      >
        <template v-if="obj.extend.validate === 'success'">
          <v-icon
            color="success"
            small
            left
          >
            mdi-check-circle
          </v-icon>
          集群连接成功
        </template>
        <template v-else-if="obj.extend.validate === 'error'">
          <v-icon
            color="error"
            small
            left
          >
            mdi-close-circle
          </v-icon>
          集群连接失败
        </template>
        <template v-if="obj.extend.validate === 'progressing'">
          <v-icon
            color="warning"
            small
            left
          >
            mdi-checkbox-blank-circle
          </v-icon>
          集群连接中......
        </template>
      </v-flex>
    </v-card-text>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { postValidateClusterKubeConfig } from '@/api'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'TestKubeConfig',
  data: () => ({
    valid: false,
    obj: {
      ClusterID: 0,
      ClusterName: '',
      KubeConfig: '',
      Primary: false,
      Vendor: 'selfhosted',
      ImageRepo: 'registry.cn-beijing.aliyuncs.com/kubegems',
      DefaultStorageClass: 'local-path',
      extend: {
        storageClasses: [],
        imageRepos: [
          'registry.cn-beijing.aliyuncs.com/kubegems',
          'docker.io/kubegems',
        ],
        validate: 'progressing',
        clusterName: '',
        existInstaller: false,
      },
    },
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
        this.validateKubeConfig()
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
    async validateKubeConfig() {
      const data = await postValidateClusterKubeConfig({
        kubeconfig: JSON.stringify(this.$yamlload(this.obj.KubeConfig)),
      })
      this.obj.extend.storageClasses = data.storageClasses
      this.obj.extend.validate = data.connectable ? 'success' : 'error'
      this.obj.extend.clusterName = data.clusterName
      this.obj.extend.existInstaller = data.existInstaller
      this.$emit('refresh', this.obj)
    },
  },
}
</script>

