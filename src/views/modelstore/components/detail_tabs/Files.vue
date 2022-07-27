<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
  <div class="mt-3 white rounded pa-4">
    <div v-for="(file, index) in files" :key="index" class="file text-subtitle-2 kubegems__text">
      <!-- <div class="float-left"> 2022-04-23 12:12:12 CST </div>
      <div class="float-left file__size">11 KiB</div> -->
      <div class="float-left">
        <v-icon color="primary" small>mdi-file</v-icon>
        {{ file.filename }}
      </div>
      <div class="kubegems__clear-float" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Files',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: function () {
      return {
        files: [],
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.files = newValue?.files;
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    line-height: 24px;
    font-size: 14px;

    &__size {
      width: 120px;
      text-align: center;
    }
  }
</style>
