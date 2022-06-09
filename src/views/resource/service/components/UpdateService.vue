<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新服务"
    icon="mdi-dns"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="Service"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateService"
      >
        确定
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        style="margin-top: 8px !important;"
        color="white"
        hide-details
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 white--text font-weight-medium">
            YAML
          </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchUpdateService, getServiceDetail } from '@/api'
import ServiceBaseForm from './ServiceBaseForm'
import BaseResource from '@/mixins/resource'
import ServiceSchema from '@/views/resource/service/mixins/schema'
import { randomString, deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateService',
  components: {
    ServiceBaseForm,
  },
  mixins: [BaseResource, ServiceSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    item: null,
    formComponent: 'ServiceBaseForm',
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
    async updateService() {
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
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].getYaml()
          data = this.$yamlload(data)
          if (!this.m_resource_checkDataWithNS(data, this.item.metadata.namespace)) return
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'ServiceBaseForm') {
          data = this.$refs[this.formComponent].getData()
          data = this.m_resource_beautifyData(data)
        }
        if (
          (!data.spec.ports || data.spec.ports.length === 0) &&
          data.spec.clusterIP !== 'None' &&
          data.spec.type !== 'ExternalName'
        ) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请添加端口配置',
            color: 'warning',
          })
          return
        }
        await patchUpdateService(
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
      this.item = null
      const data = await getServiceDetail(
        this.ThisCluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.item = deepCopy(data)
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].getData()
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
        const yaml = this.$refs[this.formComponent].getYaml()
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
        this.formComponent = 'ServiceBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'ServiceBaseForm'
      this.yaml = false
    },
  },
}
</script>
