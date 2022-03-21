<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新网关"
    icon="mdi-gate"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="Gateway"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateGateway"
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
import { mapGetters, mapState } from 'vuex'
import { putUpdateGateway, getGatewayDetail } from '@/api'
import GatewayBaseForm from './GatewayBaseForm'
import BaseResource from '@/mixins/resource'
import GatewaySchema from '@/views/resource/gateway/mixins/schema'
import { deepCopy, randomString } from '@/utils/helpers'

export default {
  name: 'UpdateGateway',
  components: {
    GatewayBaseForm,
  },
  mixins: [BaseResource, GatewaySchema],
  data: () => ({
    dialog: false,
    yaml: null,
    item: null,
    formComponent: 'GatewayBaseForm',
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateGateway() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_checkDataWithOutNS(data)) return
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'GatewayBaseForm') {
          data = this.$refs[this.formComponent].getData()
          data = this.m_resource_beautifyData(data)
        }
        await putUpdateGateway(
          this.Tenant().ID,
          this.ThisClusterID,
          this.item.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].getData()
        this.formComponent = 'BaseYamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        if (!this.m_resource_validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'GatewayBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(name) {
      this.item = null
      const data = await getGatewayDetail(
        this.Tenant().ID,
        this.ThisClusterID,
        name,
      )
      this.item = deepCopy(data)
      this.$refs[this.formComponent].setData(deepCopy(data))
      if (
        data &&
        data.spec &&
        data.spec.configMapData &&
        data.spec.configMapData.http2.toLowerCase() === 'true'
      ) {
        this.$refs[this.formComponent].protocol = 'http/2'
      } else {
        this.$refs[this.formComponent].protocol = 'http/1.1'
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'GatewayBaseForm'
      this.yaml = false
    },
  },
}
</script>
