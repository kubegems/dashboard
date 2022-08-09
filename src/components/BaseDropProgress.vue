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
  <div class="text-center primary--text progress__loading" :style="{ fontFamily: 'kubegems-sample' }">
    <span
      v-for="(char, index) in processName"
      :key="index"
      class="progress__loading__span"
      :style="{ animationDelay: `${index * 70}ms`, left: `${charWidth[index]}px` }"
    >
      {{ char }}
    </span>
  </div>
</template>

<script>
  export default {
    name: 'BaseDropProgress',
    data() {
      return {
        processName: this.$PLATFORM,
        charWidth: [0, 13, 24, 36, 46, 60, 70, 86, 98, 110, 122, 134, 146],
      };
    },
  };
</script>

<style lang="scss" scoped>
  .progress {
    &__loading {
      font-family: 'kubegems-sample';
      font-size: 20px;
      position: relative;
      left: 50%;
      transform: translate(-50%, 0%);
      width: 100px;

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
