<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建配置"
    icon="mdi-wrench"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="ConfigMap"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addConfigMap"
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
import { postAddConfigMap } from '@/api'
import ConfigMapBaseForm from './ConfigMapBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import ConfigmapSchema from '@/views/resource/configmap/mixins/schema'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddConfigMap',
  components: {
    ConfigMapBaseForm,
    YamlForm,
  },
  mixins: [BaseResource, ConfigmapSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'ConfigMapBaseForm',
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
    async addConfigMap() {
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
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'ConfigMapBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        const namespace = this.AdminViewport
          ? data?.metadata?.namespace
          : this.ThisNamespace
        if (!this.checkDataWithNS(data, namespace)) {
          return
        }
        await postAddConfigMap(
          this.$route.query.Cluster || this.ThisCluster,
          namespace,
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
        this.addNsToData(
          data,
          this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace,
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
          this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace,
        )
        if (!this.validateJsonSchema(this.schema, data)) {
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
