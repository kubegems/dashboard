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
  <v-dialog
    v-model="dialog"
    eager
    fullscreen
    hide-overlay
    no-click-animation
    persistent
    transition="dialog-bottom-transition"
    @keydown.esc="escOccur"
  >
    <v-card class="rounded-0" flat>
      <v-flex class="px-4 py-3 primary white--text full-screen__position">
        <div v-if="kubegemsLogo" class="justify-center float-left text-h6 py-1">
          <span class="hidden-sm-and-down float-left">
            <v-img class="kubegems__absolute-middle" contain :src="LOGO_WHITE" width="140" />
          </span>
          <span
            class="pl-2 text-h6"
            :style="{
              fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`,
              fontWeight: `bold`,
              fontSize: `1.1rem !important`,
              marginLeft: `140px`,
            }"
          >
            {{ title }}
          </span>
        </div>
        <div v-else class="justify-center float-left text-h6 py-1">
          <v-icon class="white--text mt-n1" left>{{ icon }}</v-icon>
          <span class="white--text">{{ title }}</span>
        </div>
        <div class="float-left mt-2 white--text ml-3">
          <slot name="header" />
        </div>
        <v-flex class="float-right">
          <v-flex class="float-left" :style="{ marginTop: `${actionTop}px` }">
            <div v-if="store.state.Progress" :style="{ float: 'left', marginTop: '5px', marginRight: '8px' }">
              <v-progress-circular color="white" indeterminate size="20" width="3" />
            </div>
            <slot name="action" />
          </v-flex>
          <v-flex class="float-left">
            <v-btn class="mx-2" color="white" text @click="close">
              {{ i18n.t('operate.close') }}
            </v-btn>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <v-divider />
      <v-card-text class="pa-0 full-screen-mt">
        <slot name="content" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { LOGO_WHITE } from '@kubegems/libs/constants/platform';
  import { ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      icon?: string;
      actionTop?: number;
      title?: string;
      kubegemsLogo?: boolean;
      value: boolean;
    }>(),
    {
      icon: '',
      actionTop: 2,
      title: '',
      kubegemsLogo: false,
      value: false,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();

  const dialog = ref<boolean>(false);
  const emit = defineEmits(['dispose', 'input']);
  const close = (): void => {
    emit('dispose');
    store.commit('SET_DIALOG', false);
    dialog.value = false;
    emit('input', false);
  };

  const escOccur = () => {
    emit('dispose');
    store.commit('SET_FULL_DIALOG', false);
    dialog.value = false;
    emit('input', false);
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (newValue !== undefined) {
        store.commit('SET_DIALOG', newValue);
        dialog.value = newValue;
      }
    },
    { deep: true },
  );
</script>

<style lang="scss" scoped>
  .full-screen__position {
    position: fixed;
    z-index: 10;
    width: 100%;
    height: 64px;
  }

  .full-screen-mt {
    margin-top: 64px;
  }
</style>
