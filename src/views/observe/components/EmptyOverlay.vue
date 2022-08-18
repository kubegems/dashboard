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
  <transition name="fade">
    <v-flex v-if="visible" class="empty-overlay">
      <slot>{{ text }}</slot>
    </v-flex>
  </transition>
</template>

<script>
  export default {
    name: 'EmptyOverlay',
    props: {
      text: {
        type: String,
        default: '',
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .empty-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 45px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(#ffffff, 1);
    backdrop-filter: blur(2px);
    color: $primary;
    font-size: 1.2rem;
    font-weight: 600;
  }
</style>
