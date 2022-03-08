<template>
  <div />
</template>

<script>
import { getOauthCallback } from '@/api'

export default {
  name: 'Callback',
  async mounted() {
    const code = this.$route.query.code
    const source = this.$route.params.source
    const data = await getOauthCallback(source, { code: code })
    this.$router.push({ name: 'login', query: { token: data.token } })
  },
}
</script>
