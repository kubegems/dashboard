<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新任务"
    icon="mdi-repeat-once"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :step="step"
        :edit="true"
        title="Job"
        kind="Job"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1 || formComponent === 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="updateJob"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'BaseYamlForm'"
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
import { patchUpdateJob, getJobDetail } from '@/api'
import JobBaseForm from './JobBaseForm'
import BaseResource from '@/mixins/resource'
import JobSchema from '@/views/resource/job/mixins/schema'
import { deepCopy, randomString } from '@/utils/helpers'

export default {
  name: 'UpdateJob',
  components: {
    JobBaseForm,
  },
  mixins: [BaseResource, JobSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    item: null,
    formComponent: 'JobBaseForm',
    step: 0,
    totalStep: 4,
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateJob() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_checkDataWithNS(data, this.item.metadata.namespace)) return
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'JobBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        await patchUpdateJob(
          this.ThisCluster,
          this.item.metadata.namespace,
          this.item.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getJobDetail(
        this.ThisCluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.formComponent = 'JobBaseForm'
      this.item = deepCopy(data)
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].obj
        this.m_resource_addNsToData(
          data,
          this.AdminViewport
            ? this.item.metadata.namespace
            : this.ThisNamespace,
        )
        this.formComponent = 'BaseYamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        this.m_resource_addNsToData(
          data,
          this.AdminViewport
            ? this.item.metadata.namespace
            : this.ThisNamespace,
        )
        if (!this.m_resource_validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'JobBaseForm'
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
          (!data.spec.template.spec.containers ||
            (data.spec.template.spec.containers &&
              data.spec.template.spec.containers.length === 0))
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
      this.formComponent = ''
      this.yaml = false
    },
  },
}
</script>
