<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新配置"
    icon="mdi-wrench"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="ConfigMap"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateConfigMap"
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
import { patchUpdateConfigMap, getConfigMapDetail } from '@/api'
import ConfigMapBaseForm from './ConfigMapBaseForm'
import BaseResource from '@/mixins/resource'
import ConfigmapSchema from '@/views/resource/configmap/mixins/schema'
import { deepCopy, randomString } from '@/utils/helpers'

export default {
  name: 'UpdateConfigMap',
  components: {
    ConfigMapBaseForm,
  },
  mixins: [BaseResource, ConfigmapSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'ConfigMapBaseForm',
    item: null,
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
    async updateConfigMap() {
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
          if (!this.m_resource_checkDataWithNS(data, this.item.metadata.namespace)) return
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'ConfigMapBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        await patchUpdateConfigMap(
          this.$route.query.Cluster || this.ThisCluster,
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
      this.item = null
      const data = await getConfigMapDetail(
        this.$route.query.Cluster || this.ThisCluster,
        item.metadata.namespace,
        item.metadata.name,
      )
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
        this.formComponent = 'ConfigMapBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'ConfigMapBaseForm'
      this.yaml = false
    },
  },
}
</script>
