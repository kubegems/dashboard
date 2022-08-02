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
  <v-sheet :class="`py-1 px-2 text-subtitle-1 primary--text rounded ${color}`" :height="height">
    <span
      :class="`float-left subtitle font-weight-regular ${
        color === 'primary' ? 'white--text' : 'blue-grey--text text--darken-2'
      } ${divider || `pl-${pl}`}`"
      :style="{ lineHeight: `28px;` }"
    >
      {{ title }}
    </span>
    <span class="float-left text-body-2 subtitle-line-height">
      <slot name="tips" />
    </span>
    <span class="float-left ml-4 text-body-2 subtitle-line-height">
      <slot name="header" />
    </span>
    <span class="float-right">
      <slot name="action" />
    </span>
    <span class="float-right mr-1">
      <slot name="selector" />
    </span>
    <div class="subtitle-clear" />
    <v-divider v-if="divider" />
  </v-sheet>
</template>

<script>
  export default {
    name: 'BaseSubTitle',
    props: {
      color: {
        type: String,
        default: () => '',
      },
      divider: {
        type: Boolean,
        default: () => true,
      },
      height: {
        type: String,
        default: () => '36px',
      },
      pl: {
        type: Number,
        default: () => 2,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .subtitle-clear {
    clear: both;
  }
  .subtitle-line-height {
    line-height: 28px !important;
  }
</style>
