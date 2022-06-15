<template>
  <BaseDialog v-model="dialog" icon="mdi-account" title="创建用户" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="用户定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.Username" class="my-0" label="用户名" required :rules="objRules.usernameRules" />
            <v-text-field v-model="obj.Password" class="my-0" label="密码" required :rules="objRules.passwordRules">
              <template #append>
                <v-btn class="mt-n1" color="primary" small text @click.stop="randomPassword">
                  <v-icon left small> mdi-eye </v-icon>
                  生成随机密码
                </v-btn>
              </template>
            </v-text-field>
            <v-text-field v-model="obj.Email" class="my-0" label="邮箱" required :rules="objRules.emailRules" />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addUser"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postAddUser } from '@/api';
  import { required, email, password } from '@/utils/rules';

  export default {
    name: 'AddUser',
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        Username: '',
        Password: '',
        Email: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          usernameRules: [required],
          passwordRules: [password],
          emailRules: [email],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
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
        this.obj.Password = s;
      },
      async addUser() {
        if (this.$refs.form.validate(true)) {
          await postAddUser(this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
