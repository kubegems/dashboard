<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
  >
    <v-card
      class="my-2 pa-2"
      flat
    >
      <v-card-text class="pa-0">
        <v-sheet class="pt-2 px-0">
          <v-flex
            class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
          >
            <span>邮箱配置</span>
          </v-flex>
          <v-flex class="float-left ml-0 kubegems__form-width">
            <v-text-field
              v-model="smtpServerInput"
              class="my-0"
              required
              label="SMTP服务器"
              :rules="emailConfigRules.smtpServerRule"
            />
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-text-field
              v-model="port"
              class="my-0"
              required
              label="端口"
              :rules="emailConfigRules.portRule"
            >
              <template #append>
                <v-switch
                  v-model="emailConfig.requireTLS"
                  required
                  hide-details
                  dense
                  style="display: flex; justify-content: center;"
                  @change="onRequireTLSChange"
                >
                  <template #label>
                    <span style="margin-bottom: 10px;">TLS</span>
                  </template>
                </v-switch>
              </template>
            </v-text-field>
          </v-flex>
          <v-flex
            class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
          />
          <v-flex class="float-left ml-0 kubegems__form-width">
            <v-text-field
              v-model="emailConfig.from"
              class="my-0"
              required
              label="发件人邮箱"
              :rules="emailConfigRules.fromRule"
            />
          </v-flex>
          <v-flex class="float-left kubegems__form-width">
            <v-text-field
              v-model="emailConfig.authPassword"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show ? 'text' : 'password'"
              class="my-0 ml-2"
              required
              label="发件人邮箱密码"
              :rules="emailConfigRules.authPasswordRule"
              @click:append="show = !show"
            />
          </v-flex>
          <v-flex
            class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
          />
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-sheet class="px-0">
          <v-flex
            class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
          />
          <v-flex class="float-left kubegems__long-width">
            <v-autocomplete
              v-model="emailToSelected"
              color="primary"
              :items="emailToSelect"
              :rules="emailConfigRules.toRule"
              :search-input.sync="emailText"
              label="收件人"
              hide-selected
              multiple
              class="my-0"
              no-data-text="暂无可选数据"
              @keydown.13="createEmail"
              @change="onEmailChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                  <v-icon
                    small
                    @click="removeEmail(item)"
                  >
                    mdi-close
                  </v-icon>
                </v-chip>
              </template>
            </v-autocomplete>
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
          @click="sendTestEmail"
        >
          发送测试邮件
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
  </v-form>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getEnvironmentUserList, userSelectData, postSendTestEmail } from '@/api'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'EmailForm',
  mixins: [BaseResource],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    obj: {
      type: Object,
      default: () => null,
    },
    namespace: {
      type: String,
      default: () => '',
    },
    configIndex: {
      type: Number,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },

  data() {
    return {
      valid: false,
      expand: true,
      emailConfigsCopy: {},
      show: false,
      emailConfig: {
        from: '',
        to: '',
        smtpServer: '',
        requireTLS: false,
        authPassword: '',
      },
      port: 25,
      smtpServerInput: null,
      emailConfigRules: {
        portRule: [required],
        toRule: [required],
        fromRule: [required],
        smtpServerRule: [required],
        authPasswordRule: [required],
      },
      emailToSelect: [],
      emailToSelected: [],
      emailText: '',
    }
  },
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    smtpServer() {
      return `${this.smtpServerInput}:${this.port}`
    },
  },
  watch: {
    data() {
      this.emailConfigsCopy = deepCopy(this.data.emailConfigs)
    },
    smtpServer() {
      this.emailConfig.smtpServer = this.smtpServer
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.edit) this.useEmailList()
    })
  },
  methods: {
    // 更新时调用, 针对自动补全组件v-autocomplete需要提前获取items数据
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      this.emailConfig = deepCopy(this.obj.emailConfigs[this.configIndex])
      const emails = this.emailConfig.to.split(',')
      this.emailToSelected = emails
      await this.useEmailList()
      this.emailToSelect = this.emailToSelect.concat(emails)
      this.smtpServerInput = this.emailConfig.smtpServer.split(':')[0]
      this.port = this.emailConfig.smtpServer.split(':')[1]
      this.expand = true
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        this.emailListToString()
        this.$emit('addData', deepCopy(this.emailConfig))
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$emit('closeCard')
    },
    async useEmailList() {
      // 普通用户视图
      let data = {}
      if (!this.AdminViewport) {
        data = await getEnvironmentUserList(this.Environment().ID, {
          size: 500,
          noprocessing: true,
        })
      } else {
        // 管理员
        data = await userSelectData()
      }
      this.emailToSelect = data.List.filter((user) => {
        return user.Email && user.Email && user.Email.length > 0
      }).map((user) => {
        return { text: user.Email, value: user.Email }
      })
    },
    onEmailChange() {
      const emailToSelected = this.emailToSelected.filter((email) => {
        return email !== '' && typeof email === 'object'
      })
      this.emailToSelected = emailToSelected
    },
    createEmail() {
      if (!this.emailText) return
      if (
        !new RegExp(
          '^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$',
        ).test(this.emailText)
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: '邮箱格式错误',
          color: 'warning',
        })
        return
      }
      this.emailToSelect.push({
        text: this.emailText,
        value: this.emailText,
      })
      this.emailToSelected.push(this.emailText)
      this.emailText = ''
    },
    removeEmail(item) {
      const emailToSelected = this.emailToSelected.filter((email) => {
        return email !== item
      })
      this.emailToSelected = emailToSelected
    },
    emailListToString() {
      if (this.emailToSelected.length > 0) {
        this.emailConfig.to = this.emailToSelected.join(',')
      } else {
        this.emailConfig.to = ''
      }
    },
    async sendTestEmail() {
      if (this.$refs.form.validate(true)) {
        var namespace = this.namespace
        if (namespace === '') {
          namespace = '_all'
        }
        this.emailListToString()
        await postSendTestEmail(this.$route.query.cluster, namespace, '_', {
          authPassword: this.emailConfig.authPassword,
          from: this.emailConfig.from,
          requireTLS: this.emailConfig.requireTLS,
          smtpServer: this.emailConfig.smtpServer,
          to: this.emailConfig.to,
        })
        this.$store.commit('SET_SNACKBAR', {
          text: '发送测试邮件成功！',
          color: 'success',
        })
      }
    },
    onRequireTLSChange() {
      this.port = this.emailConfig.requireTLS ? 465 : 25
    },
  },
}
</script>
