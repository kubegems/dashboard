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

<script lang="ts" setup>
  import { useRouter } from '@kubegems/extension/proxy';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted } from 'vue';

  import { useI18n } from './i18n';
  import { Auth } from '@/types/auth';

  const i18nLocal = useI18n();
  const query = useQuery();
  const store = useStore();
  const router = useRouter();

  onMounted(async () => {
    const { code, state } = query.value;
    if (code && state) {
      const data = await new Auth().getCallbackToken({ code: code, state: state });
      router.push({ name: 'login', query: { token: data.token } });
    } else {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('status.failed'),
        color: 'warning',
      });
    }
  });
</script>
