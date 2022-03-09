<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
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
          <v-autocomplete
            v-model="obj.tokenType"
            :items="tokenTypeItems"
            :rules="objRules.tokenTypeRule"
            color="primary"
            label="token类型"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
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
    tokenTypeItems: [
      { text: 'Bearer', value: 'Bearer' },
    ],
    obj: {
      config: {
        enableTLS: true,
        basedn: '',
        binduser: '',
        password: '',
        ldapaddr: '',
      },
      tokenType: '',
    },
  }),
  computed: {
    objRules() {
      return {
        basednRule: [required],
        binduserRule: [required],
        passwordRule: [required],
        ldapaddrRule: [required],
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
  },
}
</script>
