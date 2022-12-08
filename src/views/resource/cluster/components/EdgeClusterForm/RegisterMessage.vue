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
  <v-form lazy-validation @submit.prevent>
    <v-card-text class="py-6 px-2 mt-2 text-subtitle-1 text-center">
      <v-icon color="green" size="40">mdi-check-circle</v-icon>
      {{ i18nLocal.t('tip.success_added') }}
    </v-card-text>
    <v-card-text>
      <div class="pa-3 code">
        <v-btn class="code__copy" color="primary" icon small @click="copyMessage">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        <input id="copyed" type="hidden" :value="copyedMessage" />
        <code class="hljs language-coffeescript">
          <span class="orange--text">$ curl</span>
          <span>
            -k
            {{ edgeCluster.status.register.url }}
          </span>
          |
          <span class="orange--text">k3s kubectl</span>
          <span> apply -f </span>
        </code>
      </div>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed } from 'vue';

  import { useI18n } from '../../i18n';
  import { useStore } from '@/store';
  import { EdgeCluster } from '@/types/edge_cluster';

  const props = withDefaults(
    defineProps<{
      edgeCluster?: EdgeCluster;
    }>(),
    {
      edgeCluster: undefined,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();

  const copyedMessage: ComputedRef<string> = computed(() => {
    return `curl -k ${props.edgeCluster.status.register.url || ''} | k3s kubectl apply -f`;
  });
  const copyMessage = async (): Promise<void> => {
    let text = (document.getElementById('copyed') as HTMLInputElement).value;
    await navigator.clipboard.writeText(text);
    store.commit('SET_SNACKBAR', {
      text: i18nLocal.t('tip.copyed'),
      color: 'success',
    });
  };
</script>

<style lang="scss" scoped>
  .code {
    position: relative;
    background-color: #f6f8fa;
    border-radius: 8px;

    &__copy {
      position: absolute;
      right: 2px;
      top: 10px;
    }

    > code {
      font-size: 100%;
    }
  }
</style>
