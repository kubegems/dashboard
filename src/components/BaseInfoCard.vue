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
  <v-card :flat="flat">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-left">
        <Icon :icon="icon" class="mr-4 primary--text" width="50px" height="50px" />
        <div class="mx-2 info-card-width text-center">
          <h2 class="text-h5">{{ num }} {{ unit }}</h2>
          <h5 class="text-subtitle-2 font-weight-regular">{{ title }}</h5>
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
      num: {
        type: Number,
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

<style lang="scss" scoped>
  .info-card-width {
    width: 100px;
  }
</style>
