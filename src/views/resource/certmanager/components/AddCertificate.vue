<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建证书"
    icon="mdi-book-open"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="Certificate"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addCertificate"
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
import { postAddCertificate } from '@/api'
import CertificateBaseForm from './CertificateBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import CertmanagerSchema from '@/views/resource/certmanager/mixins/schema'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddCertificate',
  components: {
    CertificateBaseForm,
    YamlForm,
  },
  mixins: [BaseResource, CertmanagerSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'CertificateBaseForm',
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
    async addCertificate() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        if (this.$refs[this.formComponent].obj.spec.dnsNames.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请添加域名',
            color: 'warning',
          })
          return
        }
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'CertificateBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        const namespace = this.AdminViewport
          ? data?.metadata?.namespace
          : this.ThisNamespace
        if (!this.checkDataWithNS(data, namespace)) {
          return
        }
        await postAddCertificate(
          this.ThisCluster,
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
        this.formComponent = 'CertificateBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
          this.$refs[this.formComponent].init()
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'CertificateBaseForm'
      this.yaml = false
    },
  },
}
</script>
