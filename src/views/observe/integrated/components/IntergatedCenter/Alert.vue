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
  <div
    class="v-alert v-sheet theme--dark v-alert--border v-alert--dense v-alert--border-left yellow-bg"
    mdxtype="Alert"
    role="alert"
  >
    <div class="v-alert__wrapper">
      <i aria-hidden="true" class="v-icon notranslate v-alert__icon mdi mdi-alert theme--dark warning--text" />
      <div class="v-alert__content warning--text"> {{ message }}</div>
      <div class="v-alert__border v-alert__border--left" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Alert',
    props: {
      message: {
        type: String,
        default: () => '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-alert__content {
    font-size: 14px;
  }
  .yellow-bg {
    background-color: rgb(253, 242, 231);
  }
</style>
