<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-overlay :opacity="0.3" :value="Progress && !DialogActive && !PanelActive && !FullDialogActive">
    <!-- <v-progress-circular indeterminate size="64" :width="5"></v-progress-circular> -->
    <v-card class="progress__light" width="130px" height="100px">
      <v-card-text>
        <div class="text-center primary--text progress__loading" :style="{ fontFamily: 'kubegems-sample' }">
          <span class="progress__loading__span" :style="{ animationDelay: '0ms', left: '0px' }">K</span>
          <span class="progress__loading__span" :style="{ animationDelay: '70ms', left: '13px' }">u</span>
          <span class="progress__loading__span" :style="{ animationDelay: '140ms', left: '24px' }">b</span>
          <span class="progress__loading__span" :style="{ animationDelay: '210ms', left: '36px' }">e</span>
          <span class="progress__loading__span" :style="{ animationDelay: '280ms', left: '46px' }">G</span>
          <span class="progress__loading__span" :style="{ animationDelay: '350ms', left: '60px' }">e</span>
          <span class="progress__loading__span" :style="{ animationDelay: '420ms', left: '70px' }">m</span>
          <span class="progress__loading__span" :style="{ animationDelay: '490ms', left: '86px' }">s</span>
        </div>
        <div class="text-subtitle-2 text-center grey--text" :style="{ marginTop: '50px' }">数据获取中...</div>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseProgress',
    computed: {
      ...mapState(['Progress', 'DialogActive', 'PanelActive', 'FullDialogActive']),
    },
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
