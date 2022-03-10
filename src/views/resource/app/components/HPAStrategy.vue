<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="弹性伸缩设置"
    icon="fas fa-cogs"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="弹性伸缩定义">
        <template #action>
          <v-btn
            v-if="obj.cpu > 0 && obj.memory > 0"
            small
            text
            color="primary"
            class="float-right mr-2"
            @click="removeHPAStrategy"
          >
            <v-icon
              left
              small
            >
              mdi-delete
            </v-icon>
            清除弹性伸缩策略
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-card-text class="px-2 pb-0">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-sheet>
            <v-text-field
              v-model="obj.cpu"
              class="my-0"
              required
              label="最大CPU使用率"
              suffix="%"
              :rules="objRules.cpuRules"
            />
            <v-text-field
              v-model="obj.memory"
              class="my-0"
              required
              label="最大内存使用率"
              suffix="%"
              :rules="objRules.memoryRules"
            />
            <v-text-field
              v-model="obj.min_replicas"
              class="my-0"
              required
              :rules="objRules.minReplicasRules"
              label="最小副本数"
              type="number"
            />
            <v-text-field
              v-model="obj.max_replicas"
              class="my-0"
              required
              :rules="objRules.maxReplicasRules"
              label="最大副本数"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="setAppHPAStrategyAndPublish"
      >
        确定并发布
      </v-btn>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="setAppHPAStrategy"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAppHPAStrategy, getAppRunningHPA, deleteHPAStrategy, postSyncAppResource } from '@/api'
import BaseResource from '@/mixins/resource'

export default {
  name: 'HPAStrategy',
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    valid: false,
    obj: {
      cluster: '',
      kind: '',
      name: '',
      namespace: '',
      cpu: '',
      max_replicas: 0,
      memory: '',
      min_replicas: 0,
    },
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
    objRules() {
      return {
        cpuRules: [
          (v) => {
            if (v !== '') {
              if (!new RegExp('^\\d+$').test(v)) {
                return '数字格式错误'
              } else {
                if (parseInt(v) < 0) return '小于最小限制'
                if (parseInt(v) > 100) return '大于最大限制'
                return true
              }
            } else if (this.obj.cpu === '' && this.obj.memory === '') {
              return '最大CPU使用率,最大内存使用率必填一项'
            }
            return true
          },
        ],
        memoryRules: [
          (v) => {
            if (v !== '') {
              if (!new RegExp('^\\d+$').test(v)) {
                return '数字格式错误'
              } else {
                if (parseInt(v) < 0) return '小于最小限制'
                if (parseInt(v) > 100) return '大于最大限制'
                return true
              }
            } else if (this.obj.cpu === '' && this.obj.memory === '') {
              return '最大CPU使用率,最大内存使用率必填一项'
            }
            return true
          },
        ],
        minReplicasRules: [(v) => parseInt(v) >= 0 || '小于最小限制'],
        maxReplicasRules: [
          (v) => parseInt(v) >= 0 || '小于最小限制',
          (v) =>
            parseInt(this.obj.min_replicas) < parseInt(v) ||
            '最小副本数超过最大副本数',
        ],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async setAppHPAStrategyAndPublish() {
      await this.setAppHPAStrategy()
      await this.syncAppResource()
      this.reset()
    },
    async syncAppResource() {
      await postSyncAppResource(
        this.Tenant().ID,
        this.Project().ID,
        this.Environment().ID,
        this.$route.params.name,
      )
    },
    async setAppHPAStrategy() {
      if (this.$refs.form.validate(true)) {
        this.obj.cpu = this.obj.cpu !== '' ? parseInt(this.obj.cpu) : null
        this.obj.memory =
          this.obj.memory !== '' ? parseInt(this.obj.memory) : null
        this.obj.min_replicas = parseInt(this.obj.min_replicas)
        this.obj.max_replicas = parseInt(this.obj.max_replicas)
        await postAppHPAStrategy(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          this.obj,
        )
        this.reset()
      }
    },
    async appRunningHPA() {
      this.obj.cluster = this.ThisCluster
      this.obj.kind = this.$route.query.type
      this.obj.name = this.$route.params.name
      this.obj.namespace = this.$route.query.namespace
      const data = await getAppRunningHPA(
        this.Tenant().ID,
        this.Project().ID,
        this.Environment().ID,
        this.$route.params.name,
        { noprocessing: true },
      )
      if (data.cpu > 0 && data.memory) {
        this.obj = Object.assign(this.obj, data)
        if (this.obj.cpu === 0) this.obj.cpu = ''
        if (this.obj.memory === 0) this.obj.memory = ''
      } else {
        this.obj.min_replicas = 0
        this.obj.max_replicas = 0
        this.$refs.form.resetValidation()
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      await this.appRunningHPA()
    },
    async removeHPAStrategy() {
      this.$store.commit('SET_CONFIRM', {
        title: '清除弹性伸缩策略',
        content: { text: '清除弹性伸缩策略', type: 'confirm' },
        param: {},
        doFunc: async () => {
          if (this.obj.name.length > 0) {
            await deleteHPAStrategy(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
            )
          }
          this.reset()
        },
      })
    },
    reset() {
      this.dialog = false
      this.obj = this.$options.data().obj
      this.$refs.form.resetValidation()
    },
  },
}
</script>
