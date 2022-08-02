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
  <v-menu
    :close-delay="200"
    :close-on-content-click="false"
    :max-width="`${maxWidth}px`"
    :min-width="`${minWidth}px`"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    right
    :top="top"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span v-on="on">
        <slot name="header" />
      </span>
    </template>
    <v-card flat>
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small>{{ icon }}</v-icon>
        <span>{{ title }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <slot name="content" />
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    name: 'BaseTipWindow',
    props: {
      icon: {
        type: String,
        default: () => '',
      },
      maxWidth: {
        type: Number,
        default: () => 200,
      },
      minWidth: {
        type: Number,
        default: () => 150,
      },
      title: {
        type: String,
        default: () => '',
      },
      top: {
        type: Boolean,
        default: () => true,
      },
    },
  };
</script>
