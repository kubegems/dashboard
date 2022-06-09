<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="调整副本数"
    icon="fas fa-arrows-alt-v"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="副本定义" />
      <v-card-text class="px-2 pb-0">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent
        >
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              当前副本数
              <span class="text-subtitle-2 primary--text">
                {{ replicas }}
              </span>
            </v-flex>
            <v-text-field
              v-model="obj.replicas"
              :rules="objRules.replicasRules"
              class="my-0"
              required
              label="目标副本数"
              type="number"
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
        @click="scaleAppReplicas"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAppReplicasScale, getAppRunningReplicas } from '@/api'
import BaseResource from '@/mixins/resource'

export default {
  name: 'ScaleReplicas',
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    valid: false,
    obj: {
      replicas: 0,
    },
    replicas: 0,
    objRules: {
      replicasRules: [(v) => parseInt(v) >= 0 || '小于最小限制'],
    },
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.appRunningReplicas()
    },
    async appRunningReplicas() {
      const data = await getAppRunningReplicas(
        this.Tenant().ID,
        this.Project().ID,
        this.Environment().ID,
        this.$route.params.name,
      )
      this.replicas = data.replicas
      this.obj.replicas = data.replicas
    },
    async scaleAppReplicas() {
      if (this.$refs.form.validate(true)) {
        await postAppReplicasScale(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          {},
          {
            replicas: parseInt(this.obj.replicas),
          },
        )
        this.$emit('refresh')
        this.reset()
      }
    },
    reset() {
      this.dialog = false
      this.obj = this.$options.data().obj
      this.$refs.form.resetValidation()
    },
  },
}
</script>
