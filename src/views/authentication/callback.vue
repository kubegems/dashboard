<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <div />
</template>

<script>
  import messages from './i18n';
  import { getOauthCallback } from '@/api';

  export default {
    name: 'Callback',
    i18n: {
      messages: messages,
    },
    async mounted() {
      const code = this.$route.query.code;
      const state = this.$route.query.state;
      if (code && state) {
        const data = await getOauthCallback({ code: code, state: state });
        this.$router.push({ name: 'login', query: { token: data.token } });
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('status.failed'),
          color: 'warning',
        });
      }
    },
  };
</script>
