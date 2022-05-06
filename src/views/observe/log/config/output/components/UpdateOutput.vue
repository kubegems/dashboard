<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新路由器"
    icon="mdi-road-variant"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="Output/ClusterOutput"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateOutput"
      >
        确定
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
import {
  patchOutputData,
  patchClusterOutputData,
  getClusterOutputDetailData,
  getOutputDetailData,
} from '@/api'
import OutputBaseForm from './OutputBaseForm'
import BaseResource from '@/mixins/resource'
import OutputSchema from '../mixins/schema'
import { randomString, deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateOutput',
  components: {
    OutputBaseForm,
  },
  mixins: [BaseResource, OutputSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    item: null,
    formComponent: 'OutputBaseForm',
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
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.item = null
      const action = item.kind === 'Output' ? getOutputDetailData : getClusterOutputDetailData
      const data = await action(
        this.$route.query.cluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.item = deepCopy(data)
    },
    async updateOutput() {
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
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'OutputBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        const action = data.kind === 'Output' ? patchOutputData : patchClusterOutputData
        await action(
          this.$route.query.cluster,
          this.$route.query.namespace,
          data.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].obj
        this.m_resource_addNsToData(
          data,
          this.$route.query.namespace,
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
          this.$route.query.namespace,
        )
        if (!this.m_resource_validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'OutputBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'OutputBaseForm'
      this.yaml = false
    },
  },
}
</script>
