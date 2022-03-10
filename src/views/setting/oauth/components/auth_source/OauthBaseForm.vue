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
            v-model="obj.config.redirectURL"
            :rules="objRules.redirectURLRule"
            class="my-0"
            required
            label="Redirect URL"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.authURL"
            :rules="objRules.authURLRule"
            class="my-0"
            required
            label="Auth URL"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.userInfoURL"
            :rules="objRules.userInfoURLRule"
            class="my-0"
            required
            label="UserInfo URL"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appID"
            :rules="objRules.appIDRule"
            class="my-0"
            required
            label="Application ID"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appSecret"
            :rules="objRules.appSecretRule"
            class="my-0"
            required
            label="Secret"
          />
        </v-col>
        <v-col cols="6">
          <v-combobox
            v-model="scopes"
            hide-no-data
            :items="[]"
            :search-input.sync="scopeText"
            multiple
            label="Scope"
            class="my-0"
            @change="onScopeChange"
            @keydown.enter="createScope"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="ma-1"
              >
                {{ item['text'] }}
                <v-icon
                  small
                  @click="removeScope(item)"
                >
                  mdi-close
                </v-icon>
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'OauthBaseForm',
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
    scopes: [],
    scopeText: '',
    obj: {
      config: {
        appID: '',
        appSecret: '',
        redirectURL: '',
        scopes: [],
        authURL: '',
        userInfoURL: '',
      },
      tokenType: '',
    },
  }),
  computed: {
    objRules() {
      return {
        appIDRule: [required],
        appSecretRule: [required],
        redirectURLRule: [required],
        tokenTypeRule: [required],
        authURLRule: [required],
        userInfoURLRule: [required],
      }
    },
  },
  watch: {
    item() {
      this.obj = deepCopy(this.item)
      this.scopes = this.obj.config.scopes.map((scope, index) => {
        return { text: scope, value: index }
      })
    },
  },
  methods: {
    onScopeChange() {
      const scopes = this.scopes.filter((scope) => {
        return scope !== '' && typeof scope === 'object'
      })
      this.scopes = scopes
      this.obj.config.scopes = scopes.map(scope => { return scope.text })
    },
    createScope() {
      if (!this.scopeText) return
      const index = this.scopes.length
      this.scopes.push({
        text: this.scopeText,
        value: index,
      })
      this.scopeText = ''
      this.obj.config.scopes = this.scopes.map(scope => { return scope.text })
    },
    removeScope(item) {
      const scopes = this.scopes.filter((scope) => {
        return scope.value !== item.value
      })
      this.scopes = scopes
      this.obj.config.scopes = this.scopes.map(scope => { return scope.text })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setCallback(name) {
      this.obj.config.redirectURL = `https://${this.$DOMAIN}/oauth/callback/${name}`
    },
  },
}
</script>
