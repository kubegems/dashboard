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
            v-for="(char, index) in PLATFORM"
            :key="index"
            class="progress__loading__span"
            :style="{ animationDelay: `${index * 70}ms`, left: `${charWidth[index]}px` }"
          >
            {{ char }}
          </span>
        </div>
        <div class="text-subtitle-2 text-center grey--text" :style="{ marginTop: '50px' }">{{ $t('loading') }}...</div>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { PLATFORM } from '@kubegems/libs/constants/platform';

  const store = useStore();
  const charWidth: number[] = [0, 13, 24, 36, 46, 60, 70, 86, 98, 110, 122, 134, 146];
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
