<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="重建部署"
    icon="mdi-send"
    @reset="reset"
  >
    <template #content>
      <v-flex>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <BaseDeployInfoForm
            ref="baseDeployInfoForm"
            :runtime="runtime"
          />
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="strategyDeployEnvironmentApps"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postStrategyDeployEnvironmentApps } from '@/api'
import BaseDeployInfoForm from './base/BaseDeployInfoForm'
import StrategyDeploy from '@/views/resource/deploy/mixins/deploy'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'Recreate',
  components: {
    BaseDeployInfoForm,
  },
  mixins: [StrategyDeploy],
  data() {
    return {
      dialog: false,
      valid: false,
      obj: {
        images: [],
        name: '',
        strategy: {
          recreate: {
            waitShutDown: true,
          },
          type: 'Recreate',
        },
        istioVersion: '',
      },
    }
  },
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
    async init() {
      await this.strategyDeployEnvironmentAppsDetail()
      if (this.runtime.strategy.type === 'Recreate') {
        this.obj = deepCopy(this.runtime)
      }
    },
    async strategyDeployEnvironmentApps() {
      if (
        this.$refs.baseDeployInfoForm.$refs.form.validate(true) &&
        this.$refs.form.validate(true)
      ) {
        this.obj = Object.assign(this.obj, this.$refs.baseDeployInfoForm.base)
        await postStrategyDeployEnvironmentApps(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          this.obj,
        )
        this.reset()
        // this.$emit('refresh')
        this.dialog = false
        this.$router.push({
          name: 'app-detail',
          params: { name: this.$route.params.name },
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
            kind: 'app',
            namespace: this.Environment().Namespace,
            type: this.$route.query.type,
            tab: 1,
          },
        })
      }
    },
    reset() {
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
    },
  },
}
</script>
