<template>
  <BaseDialog v-model="dialog" icon="mdi-account-key" title="重设用户密码" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="密码定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.password" class="my-0" label="新密码" required :rules="objRules.passwordRules">
              <template #append>
                <v-btn class="mt-n1" color="primary" small text @click.stop="randomPassword">
                  <v-icon left small> mdi-eye </v-icon>
                  生成随机密码
                </v-btn>
              </template>
            </v-text-field>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="resetUserPassword"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postResetUserPassword } from '@/api';
  import { password } from '@/utils/rules';

  export default {
    name: 'ResetPassword',
    data: () => ({
      dialog: false,
      valid: false,
      userId: 0,
      obj: {
        password: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          passwordRules: [password],
        };
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(userId) {
        this.userId = userId;
      },
      randomPassword() {
        let s = '';
        const t = 'abcdefhijkmnprstwxyz';
        for (let i = 0; i < 4; i++) s += t.charAt(Math.floor(Math.random() * t.length));
        const n = '1234567890';
        for (let i = 0; i < 4; i++) s += n.charAt(Math.floor(Math.random() * n.length));
        const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) s += u.charAt(Math.floor(Math.random() * u.length));
        const f = '!@#$%';
        for (let i = 0; i < 2; i++) s += f.charAt(Math.floor(Math.random() * f.length));
        this.obj.password = s;
      },
      async resetUserPassword() {
        if (this.$refs.form.validate(true)) {
          await postResetUserPassword(this.userId, this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.userId = 0;
      },
    },
  };
</script>
