<template>
  <v-flex>
    <v-card flat>
      <v-card-text class="px-6">
        <v-form
          ref="infoForm"
          v-model="validInfo"
          lazy-validation
        >
          <v-row>
            <v-col cols="12">
              <v-flex class="text-subtitle-2 kubegems__detail"> 邮箱 </v-flex>
              <v-text-field
                v-model="objInfo.Email"
                :rules="objInfoRules.emailRules"
                dense
                class="pt-0"
              />
            </v-col>
            <v-col cols="12">
              <v-flex class="text-subtitle-2 kubegems__detail"> 手机号 </v-flex>
              <v-text-field
                v-model="objInfo.Phone"
                :rules="objInfoRules.phoneRules"
                dense
                class="pt-0"
              />
            </v-col>
          </v-row>
          <v-btn
            color="primary"
            small
            class="my-4"
            @click="updateUser"
          >
            更新个人信息
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <BaseDivider />
    <v-card flat>
      <v-card-text class="px-6">
        <v-form
          ref="pwdForm"
          v-model="validPwd"
          lazy-validation
        >
          <v-row>
            <v-col cols="12">
              <v-flex class="text-subtitle-2 kubegems__detail"> 原密码 </v-flex>
              <v-text-field
                v-model="objPwd.origin"
                class="my-0"
                :rules="objPwdRules.originRules"
                dense
                :append-icon="showOrigin ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showOrigin ? 'text' : 'password'"
                @click:append="showOrigin = !showOrigin"
              />
            </v-col>
            <v-col cols="12">
              <v-flex class="text-subtitle-2 kubegems__detail"> 新密码 </v-flex>
              <v-text-field
                v-model="objPwd.new1"
                class="my-0"
                :rules="objPwdRules.new1Rules"
                dense
                :append-icon="showNew1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showNew1 ? 'text' : 'password'"
                @click:append="showNew1 = !showNew1"
              />
            </v-col>
            <v-col cols="12">
              <v-flex class="text-subtitle-2 kubegems__detail"> 确认新密码 </v-flex>
              <v-text-field
                v-model="objPwd.new2"
                class="my-0"
                :rules="objPwdRules.new2Rules"
                dense
                :append-icon="showNew2 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showNew2 ? 'text' : 'password'"
                @click:append="showNew2 = !showNew2"
              />
            </v-col>
          </v-row>
          <v-btn
            color="primary"
            small
            class="my-4"
            @click="resetPassword"
          >
            更新密码
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateUser, getLoginUserInfo, postResetPassword } from '@/api'
import { required, email, password, phone } from '@/utils/rules'

export default {
  name: 'OwnerSetting',
  data() {
    return {
      validInfo: false,
      validPwd: false,
      user: null,
      objInfo: {
        Email: '',
        Phone: '',
      },
      objPwd: {
        origin: '',
        new1: '',
        new2: '',
      },
      showOrigin: false,
      showNew1: false,
      showNew2: false,
    }
  },
  computed: {
    ...mapState(['User']),
    objInfoRules() {
      return {
        emailRules: [email],
        phoneRules: [phone],
      }
    },
    objPwdRules() {
      return {
        originRules: [required],
        new1Rules: [
          required,
          password,
        ],
        new2Rules: [
          required,
          password,
        ],
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.loginUserInfo()
    })
  },
  methods: {
    async loginUserInfo() {
      const data = await getLoginUserInfo({ noprocessing: true })
      this.user = data
      this.objInfo = Object.assign(this.objInfo, this.user)
    },
    async updateUser() {
      if (this.$refs.infoForm.validate(true)) {
        this.$store.commit('SET_CONFIRM', {
          title: `更新用户信息`,
          content: {
            text: `更新用户 ${this.User.Username} 信息`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await putUpdateUser(
              this.User.ID,
              Object.assign(this.user, this.objInfo),
            )
            const data = await getLoginUserInfo()
            this.$store.commit('SET_USER', data)
          },
        })
      }
    },
    async resetPassword() {
      if (this.$refs.pwdForm.validate(true)) {
        this.$store.commit('SET_CONFIRM', {
          title: `修改用户密码`,
          content: {
            text: `修改用户 ${this.User.Username} 密码`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postResetPassword(this.objPwd)
            this.$refs.pwdForm.reset()
          },
        })
      }
    },
  },
}
</script>
