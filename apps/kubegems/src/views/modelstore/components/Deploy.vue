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
  <BaseFullScreenDialog
    v-model="state.dialog"
    kubegems-logo
    :logo="config.layout.LOGO_WHITE"
    :title="i18n.t('header.model_store')"
    @dispose="dispose"
  >
    <template #content>
      <v-flex>
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <ModelInfo :item="item" no-version />
          </v-col>
          <v-flex class="py-2" :style="{ height: `${height}px` }">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <DeployWizard ref="deployWizard" :item="item" @dispose="dispose" />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script lang="ts" setup>
  import { AIModel } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { ComputedRef, computed, reactive, ref } from 'vue';

  import DeployWizard from './DeployWizard/index.vue';
  import ModelInfo from './ModelInfo/index.vue';

  withDefaults(
    defineProps<{
      item?: AIModel;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
  });
  const height: ComputedRef<number> = computed(() => {
    return (window.innerHeight - 64) / store.state.Scale;
  });

  const open = (): void => {
    state.dialog = true;
  };

  const deployWizard = ref(null);
  const dispose = (): void => {
    state.dialog = false;
    deployWizard.value.reset();
  };

  defineExpose({
    open,
  });
</script>

<style lang="scss" scoped>
  .deploy-wizard-overflow-y {
    overflow-y: auto;
  }
</style>
