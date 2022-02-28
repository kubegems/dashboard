<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建定时任务"
    icon="mdi-calendar-clock"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :step="step"
        title="CronJob"
        kind="CronJob"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1 || formComponent === 'YamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="addCronJob"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'YamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'YamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        上一步
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        style="margin-top: 6px !important;"
        color="primary"
        hide-details
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 primary--text font-weight-medium">
            Yaml
          </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddCronJob } from '@/api'
import CronjobBaseForm from './CronjobBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import CronjobSchema from '@/views/resource/cronjob/mixins/schema'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddCronJob',
  components: {
    YamlForm,
    CronjobBaseForm,
  },
  mixins: [BaseResource, CronjobSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'CronjobBaseForm',
    step: 0,
    totalStep: 4,
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular', 'AdminViewport']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addCronJob() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'CronjobBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        const namespace = this.AdminViewport
          ? data.metadata.namespace
          : this.ThisNamespace
        if (!this.checkDataWithNS(data, namespace)) {
          return
        }
        await postAddCronJob(this.ThisCluster, namespace, data.metadata.name, data)
        this.reset()
        this.$emit('refresh')
      }
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].obj
        this.addNsToData(
          data,
          this.AdminViewport ? data.metadata.namespace : this.ThisNamespace,
        )
        this.formComponent = 'YamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        this.addNsToData(
          data,
          this.AdminViewport ? data.metadata.namespace : this.ThisNamespace,
        )
        if (!this.validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'CronjobBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    lastStep() {
      if (!this.$refs[this.formComponent]) {
        return
      }
      if (!this.$refs[this.formComponent].checkSaved()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请保存数据',
          color: 'warning',
        })
        return
      }
      if (this.step > 0) {
        const data = this.$refs[this.formComponent].obj
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
      if (!this.$refs[this.formComponent].checkSaved()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请保存数据',
          color: 'warning',
        })
        return
      }
      if (
        this.step < this.totalStep - 1 &&
        this.$refs[this.formComponent].validate()
      ) {
        const data = this.$refs[this.formComponent].obj
        if (
          this.step === 1 &&
          (!data.spec.jobTemplate.spec.template.spec.containers ||
            (data.spec.jobTemplate.spec.template.spec.containers &&
              data.spec.jobTemplate.spec.template.spec.containers.length === 0))
        ) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请添加容器镜像',
            color: 'warning',
          })
          return
        }
        this.step += 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.step = 0
      this.formComponent = 'CronjobBaseForm'
      this.yaml = false
    },
  },
}
</script>
