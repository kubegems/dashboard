<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="添加第三方登录"
    icon="mdi-star"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="第三方登录定义" />
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
                @keyup="onNameInput"
              />
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.vendor"
                :rules="objRules.vendorRule"
                :items="vendorItems"
                color="primary"
                label="类型"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                readonly
                @change="onVendorChange"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    small
                    class="ma-1"
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <component
          :is="formComponent"
          :ref="formComponent"
          :item="item"
        />
      </v-form>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addAuthSource"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAuthSourceConfig } from '@/api'
import OauthBaseForm from './auth_source/OauthBaseForm'
import OpenLdapBaseForm from './auth_source/OpenLdapBaseForm'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'AddAuthSource',
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
    vendorItems: [
      { text: 'Oauth', value: 'oauth' },
      { text: 'Ldap', value: 'ldap' },
      { text: 'Gitlab', value: 'gitlab' },
      { text: 'Github', value: 'github' },
    ],
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
    },
    async addAuthSource() {
      if (this.$refs.form.validate(true) && this.$refs[this.formComponent].$refs.form.validate(true)) {
        if (this.formComponent === 'OauthBaseForm' || this.formComponent === 'OpenLdapBaseForm') {
          const data = Object.assign(this.obj, this.$refs[this.formComponent].getData())
          await postAuthSourceConfig(data)
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    onVendorChange() {
      if (['oauth', 'gitlab', 'github'].indexOf(this.obj.vendor) > -1) {
        this.obj.kind = 'OAUTH'
      } else {
        this.obj.kind = 'LDAP'
      }
      this.formComponent = this.formComponents[this.obj.vendor]
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'OauthBaseForm'
      this.obj = this.$options.data().obj
    },
    onNameInput() {
      this.$refs[this.formComponent].setCallback(this.obj.name)
    },
  },
}
</script>
