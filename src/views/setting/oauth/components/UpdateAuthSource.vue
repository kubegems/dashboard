<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="配置第三方登录"
    icon="mdi-star"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="`${obj.vendor}登录定义`" />
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent
      >
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="obj.name"
                :rules="objRules.nameRule"
                class="my-0"
                required
                label="名称"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
        <component
          :is="formComponent"
          :ref="formComponent"
          :item="item"
          :vendor="obj.vendor"
          :edit="true"
        />
      </v-form>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateAuthSource"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putAuthSourceConfig } from '@/api'
import OauthBaseForm from './auth_source/OauthBaseForm'
import OpenLdapBaseForm from './auth_source/OpenLdapBaseForm'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateAuthSource',
  components: {
    OauthBaseForm,
    OpenLdapBaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    valid: false,
    item: null,
    formComponent: 'OauthBaseForm',
    formComponents: {
      oauth: 'OauthBaseForm',
      ldap: 'OpenLdapBaseForm',
      gitlab: 'OauthBaseForm',
      github: 'OauthBaseForm',
    },
    obj: {
      name: '',
      kind: 'OAUTH',
      vendor: '',
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        vendorRule: [required],
        nameRule: [required],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item) {
      this.obj = deepCopy(item)
      this.formComponent = this.formComponents[this.obj.vendor]
      this.$nextTick(() => {
        this.item = deepCopy(item)
      })
    },
    async updateAuthSource() {
      if (this.$refs.form.validate(true) && this.$refs[this.formComponent].$refs.form.validate(true)) {
        if (this.formComponent === 'OauthBaseForm' || this.formComponent === 'OpenLdapBaseForm') {
          const data = Object.assign(this.obj, this.$refs[this.formComponent].getData())
          await putAuthSourceConfig(this.obj.id, data)
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = ''
    },
  },
}
</script>
