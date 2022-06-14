<template>
  <div />
</template>

<script>
  import { getOauthCallback } from '@/api';

  export default {
    name: 'Callback',
    async mounted() {
      const code = this.$route.query.code;
      const state = this.$route.query.state;
      if (code && state) {
        const data = await getOauthCallback({ code: code, state: state });
        this.$router.push({ name: 'login', query: { token: data.token } });
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '认证失败，请登录后访问',
          color: 'warning',
        });
      }
    },
  };
</script>
