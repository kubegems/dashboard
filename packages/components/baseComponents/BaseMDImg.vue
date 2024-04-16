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
  <div mdxtype="Image" role="image" @click.stop="zoomOut">
    <img alt="" class="kubegems__pointer" :src="src" />
    <v-expand-x-transition>
      <div v-if="maximum" class="img">
        <div :class="{ img__bg: true, 'Zoomout-bg': maximum, 'Zoomin-bg': zooming }" @click.stop="zoomIn" />
        <img alt="" :class="{ img__max: true, 'Zoomout-img': maximum, 'Zoomin-img': zooming }" :src="src" />
      </div>
    </v-expand-x-transition>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  withDefaults(
    defineProps<{
      src?: string;
    }>(),
    {
      src: '',
    },
  );

  const maximum = ref(false);
  const zoomOut = () => {
    maximum.value = true;
  };

  const zooming = ref(false);
  const zoomIn = () => {
    zooming.value = true;
    const _timeout = setTimeout(() => {
      maximum.value = false;
      zooming.value = false;
      clearTimeout(_timeout);
    }, 300);
  };
</script>

<style lang="scss" scoped>
  .img {
    width: 100%;
    height: 100%;

    &__max {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 95%;
      transform: translate(-50%, -50%);
    }

    &__bg {
      position: absolute;
      width: 100%;
      background-color: gray;
      opacity: 0.75;
      top: 50%;
      left: 50%;
      height: 100%;
      transform: translate(-50%, -50%);
      border-radius: 8px;
    }
  }

  .Zoomout-bg {
    animation-name: _Zoomout_bg;
    animation-duration: 0.3s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Zoomout_bg {
    0% {
      width: 0;
    }

    100% {
      width: 100%;
    }
  }

  .Zoomout-img {
    animation-name: _Zoomout_img;
    animation-duration: 0.3s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Zoomout_img {
    0% {
      width: 0;
    }

    100% {
      width: 95%;
    }
  }

  .Zoomin-bg {
    animation-name: _Zoomin_bg;
    animation-duration: 0.3s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Zoomin_bg {
    0% {
      width: 100%;
    }

    100% {
      width: 0;
    }
  }

  .Zoomin-img {
    animation-name: _Zoomin_img;
    animation-duration: 0.3s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Zoomin_img {
    0% {
      width: 95%;
    }

    100% {
      width: 0;
    }
  }
</style>
