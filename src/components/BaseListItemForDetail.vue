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
  <v-list-item :class="`pl-2 mt-${mt}`">
    <v-list-item-content class="py-1">
      <v-list-item-title class="float-left subtitle font-weight-regular text--darken-2 pl-0 kubegems__text">
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle class="kubegems__text pl-2">
        <slot name="content" />
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
  export default {
    name: 'BaseListItemForDetail',
    props: {
      mt: {
        type: Number,
        default: () => 1,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item__title,
  .v-list-item__subtitle {
    overflow: auto !important;
    white-space: inherit !important;
    line-height: 1.5rem !important;
  }
</style>
