<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新集群"
    icon="mdi-server-plus"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :step="step"
        :edit="true"
        :control="control"
        @refresh="refresh"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="updateCluster"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1"
        :disabled="step === 1 && extend.validate !== 'success'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        上一步
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateCluster, getClusterDetail } from '@/api'
import ClusterBaseForm from './ClusterBaseForm'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateCluster',
  components: {
    ClusterBaseForm,
  },
  mixins: [BaseFilter, BaseSelect],
  props: {
    control: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    dialog: false,
    formComponent: 'ClusterBaseForm',
    item: {},
    step: 0,
    totalStep: 3,
    extend: null,
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateCluster() {
      if (this.$refs[this.formComponent].validate()) {
        const data = deepCopy(this.$refs[this.formComponent].getData())
        const config = this.$yamlload(data.KubeConfig)
        if (!data.KubeConfig) return
        await putUpdateCluster(data.ClusterID, {
          ClusterName: data.ClusterName,
          KubeConfig: config,
          ImageRepo: data.ImageRepo,
          DefaultStorageClass: data.DefaultStorageClass,
        })
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getClusterDetail(item.ID)
      this.item = data
      this.$refs[this.formComponent].init({
        ClusterID: data.ID,
        ClusterName: data.ClusterName,
        KubeConfig: this.$yamldump(data.KubeConfig),
        Primary: data.Primary,
        Vendor: data.Vendor,
        ImageRepo: data.ImageRepo,
        DefaultStorageClass: data.DefaultStorageClass,
        extend: {
          storageClasses: [],
          validate: 'progressing',
          clusterName: '',
          existInstaller: false,
        },
      })
    },
    lastStep() {
      if (!this.$refs[this.formComponent]) {
        return
      }
      if (this.step > 0) {
        const data = this.$refs[this.formComponent].getData()
        this.step -= 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].back(data)
        })
      }
    },
    nextStep() {
      if (!this.$refs[this.formComponent]) {
        return
      }
      if (this.step === 0) {
        const data = this.$refs[this.formComponent].getData()
        if (data.KubeConfig.trim() === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: '请输入KubeConfig',
            color: 'warning',
          })
          return
        }
      }
      this.extend = this.$refs[this.formComponent].getExtend()
      if (
        this.step < this.totalStep - 1 &&
        this.$refs[this.formComponent].validate()
      ) {
        const data = this.$refs[this.formComponent].getData()
        this.step += 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    refresh(data) {
      this.extend = data.extend
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.step = 0
    },
  },
}
</script>
