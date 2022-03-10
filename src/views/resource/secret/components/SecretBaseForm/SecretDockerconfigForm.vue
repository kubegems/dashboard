<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
            >
              <span class="ml-2">仓库定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.address"
                class="my-0"
                required
                label="仓库地址"
                :rules="dockerconfigRules.addressRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex
              class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
            />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.email"
                class="my-0"
                required
                label="邮箱"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex
              class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
            />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.username"
                class="my-0"
                required
                label="用户名"
                :rules="dockerconfigRules.usernameRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.password"
                class="my-0"
                required
                label="密码"
                :rules="dockerconfigRules.passwordRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

import { Base64 } from 'js-base64'

export default {
  name: 'SecretDockerconfigForm',
  props: {
    data: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      dataCopy: {},
      dockerconfig: {
        username: '',
        password: '',
        email: '',
        address: '',
      },
      dockerconfigRules: {
        usernameRule: [required],
        passwordRule: [required],
        addressRule: [required],
      },
    }
  },
  watch: {
    data() {
      this.dataCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.labels) {
      this.dataCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.dockerconfig = {
        username: data.username,
        password: data.password,
        email: data.email,
        address: data.address,
      }
      this.expand = true
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const config = {
          auths: {},
        }
        config.auths[this.dockerconfig.address] = {
          username: this.dockerconfig.username,
          password: this.dockerconfig.password,
          email: this.dockerconfig.email,
          auth: Base64.encode(
            `${this.dockerconfig.username}:${this.dockerconfig.password}`,
          ),
        }
        this.dataCopy['.dockerconfigjson'] = Base64.encode(
          JSON.stringify(config),
        )
        this.$emit('addData', this.dataCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$emit('closeOverlay')
    },
  },
}
</script>
