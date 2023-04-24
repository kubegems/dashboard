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
  <v-overlay
    :opacity="0.3"
    :value="
      store.state.Progress && !store.state.DialogActive && !store.state.PanelActive && !store.state.FullDialogActive
    "
  >
    <v-card class="progress__light" flat height="100px" width="130px">
      <v-card-text>
        <div class="text-center primary--text progress__loading" :style="{ fontFamily: 'kubegems-sample' }">
          <span
            v-for="(char, index) in progress"
            :key="index"
            class="progress__loading__span"
            :style="{ animationDelay: `${index * 70}ms`, left: `${getWidthOffset(index)}px` }"
          >
            {{ char }}
          </span>
        </div>
        <div class="text-subtitle-2 text-center grey--text" :style="{ marginTop: '50px' }"
          >{{ i18n.t('loading') }}...</div
        >
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';

  const props = withDefaults(
    defineProps<{
      progress?: string;
    }>(),
    {
      progress: '',
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();

  const keyMap = {
    K: 13,
    u: 11,
    b: 12,
    e: 10,
    G: 14,
    m: 16,
    s: 12,
    O: 14,
    p: 12,
    n: 12,
    C: 14,
    S: 14,
  };

  const getWidthOffset = (index: number): number => {
    let s = 0;
    props.progress.split('').forEach((char, i) => {
      if (i < index) {
        s += keyMap[char];
      }
    });
    return s;
  };
</script>

<style lang="scss" scoped>
  .v-progress-linear-position {
    top: 64px !important;
    z-index: 20;
  }

  .v-overlay {
    z-index: 20 !important;
  }

  .progress {
    &__light {
      background-color: #ffffff !important;
      border-color: #ffffff !important;
      color: rgba(0, 0, 0, 0.87) !important;
    }

    &__loading {
      font-family: 'kubegems-sample';
      font-size: 20px;
      position: relative;

      &__span {
        animation-name: loading;
        animation-duration: 0.5s;
        animation-timing-function: linear;
        animation-delay: 0s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        position: absolute;
      }
    }
  }

  @keyframes loading {
    0% {
      top: 0;
    }
    100% {
      top: 20px;
    }
  }
</style>
