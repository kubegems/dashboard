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
  <v-card flat>
    <v-dialog v-if="deploying" hide-overlay light persistent :value="processing" width="300">
      <v-card class="pa-1" color="primary" flat>
        <v-card-text class="text-center white--text">
          {{ i18nLocal.t('status.deploying') }}
          <v-progress-linear class="mb-0 mt-2" color="white" indeterminate />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card-text v-else class="pa-5 text-center">
      <Icon class="ml-0 success--text" height="100px" icon="mdi:check-circle" width="100px" />
      <h4 class="text-h6 mt-3 mb-8">{{ i18nLocal.t('status.deploy_success') }}</h4>
      <div class="mt-3">
        <v-btn color="primary" small text @click="showDeployStatus">
          {{ i18nLocal.t('operate.view_deploy_status') }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      base?: any;
      processing?: boolean;
    }>(),
    {
      base: undefined,
      processing: false,
    },
  );

  const i18nLocal = useI18n();

  const emit = defineEmits(['showDeployStatus']);
  const showDeployStatus = () => {
    emit('showDeployStatus', props.base);
  };

  const deploying = ref<boolean>(false);
  watch(
    () => props.processing,
    async (newValue) => {
      if (!newValue) return;
      setTimeout(() => {
        deploying.value = false;
      }, 3000);
    },
    { immediate: true, deep: true },
  );
</script>
