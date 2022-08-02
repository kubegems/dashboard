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
  <v-card :flat="flat">
    <v-card-text class="pa-5">
      <div class="d-flex align-center">
        <v-btn class="elevation-0" color="primary" dark fab small>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <div class="ml-2 mr-1">
          <h2 :class="{ 'text-subtitle-1': !large, 'text-h6': large, 'font-weight-medium': !large }">
            {{ num }} {{ unit }}
          </h2>
          <h4 class="font-weight-regular mt-1"> {{ title }} </h4>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'BaseInfoCard',
    props: {
      flat: {
        type: Boolean,
        default: () => false,
      },
      icon: {
        type: String,
        default: () => '',
      },
      large: {
        type: Boolean,
        default: () => true,
      },
      num: {
        type: [Number, String],
        default: () => 0,
      },
      title: {
        type: String,
        default: () => '',
      },
      unit: {
        type: String,
        default: () => '',
      },
    },
  };
</script>
