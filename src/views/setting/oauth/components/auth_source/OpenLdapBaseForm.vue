<template>
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
            v-model="obj.config.ldapaddr"
            :rules="objRules.ldapaddrRule"
            class="my-0"
            required
            label="Ldap地址"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.basedn"
            :rules="objRules.basednRule"
            class="my-0"
            required
            label="BaseDN"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.binduser"
            :rules="objRules.binduserRule"
            class="my-0"
            required
            label="Username"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.password"
            :rules="objRules.passwordRule"
            class="my-0"
            required
            label="Password"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.filter"
            class="my-0"
            required
            label="Filter"
          />
        </v-col>
        <v-col cols="6">
          <v-switch
            v-model="obj.config.enableTLS"
            hide-details
            class="mt-4"
            label="开启tls"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'OpenLdapBaseForm',
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    valid: false,
    show: false,
    obj: {
      config: {
        enableTLS: true,
        basedn: '',
        binduser: '',
        password: '',
        ldapaddr: '',
        filter: '',
      },
      tokenType: 'Bearer',
    },
  }),
  computed: {
    objRules() {
      return {
        basednRule: [required],
        binduserRule: [required],
        passwordRule: [required],
        ldapaddrRule: [
          required,
          (v) => !!new RegExp('^(ldap://)?(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]):([0-9]|[1-9]\\d|[1-9]\\d{2}|[1-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])$').test(v) ||
          '格式错误',
        ],
      }
    },
  },
  watch: {
    item() {
      this.obj = deepCopy(this.item)
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
  },
}
</script>
