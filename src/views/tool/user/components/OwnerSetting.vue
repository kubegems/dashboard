<template>
  <div>
    <v-row>
      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" title="个人信息" />
            <v-form ref="infoForm" v-model="validInfo" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> 邮箱 </v-flex>
                  <v-text-field v-model="objInfo.Email" class="pt-0" dense flat :rules="objInfoRules.emailRules" solo />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> 手机号 </v-flex>
                  <v-text-field v-model="objInfo.Phone" class="pt-0" dense flat :rules="objInfoRules.phoneRules" solo />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="updateUser"> 更新个人信息 </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" title="密码" />
            <v-form ref="pwdForm" v-model="validPwd" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> 原密码 </v-flex>
                  <v-text-field
                    v-model="objPwd.origin"
                    :append-icon="showOrigin ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.originRules"
                    solo
                    :type="showOrigin ? 'text' : 'password'"
                    @click:append="showOrigin = !showOrigin"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> 新密码 </v-flex>
                  <v-text-field
                    v-model="objPwd.new1"
                    :append-icon="showNew1 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new1Rules"
                    solo
                    :type="showNew1 ? 'text' : 'password'"
                    @click:append="showNew1 = !showNew1"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> 确认新密码 </v-flex>
                  <v-text-field
                    v-model="objPwd.new2"
                    :append-icon="showNew2 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new2Rules"
                    solo
                    :type="showNew2 ? 'text' : 'password'"
                    @click:append="showNew2 = !showNew2"
                  />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="resetPassword"> 更新密码 </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import { getLoginUserInfo, postResetPassword, putUpdateUser } from '@/api';
  import { email, password, phone, required } from '@/utils/rules';

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
      };
    },
    computed: {
      ...mapState(['User']),
      objInfoRules() {
        return {
          emailRules: [email],
          phoneRules: [phone],
        };
      },
      objPwdRules() {
        return {
          originRules: [required],
          new1Rules: [required, password],
          new2Rules: [required, password],
        };
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.loginUserInfo();
      });
    },
    methods: {
      async loginUserInfo() {
        const data = await getLoginUserInfo({ noprocessing: true });
        this.user = data;
        this.objInfo = Object.assign(this.objInfo, this.user);
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
              await putUpdateUser(this.User.ID, Object.assign(this.user, this.objInfo));
              const data = await getLoginUserInfo();
              this.$store.commit('SET_USER', data);
            },
          });
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
              await postResetPassword(this.objPwd);
              this.$refs.pwdForm.reset();
            },
          });
        }
      },
    },
  };
</script>
