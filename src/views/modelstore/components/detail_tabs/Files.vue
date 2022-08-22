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
  <div class="mt-3 white rounded pa-4">
    <template v-if="files.length > 0">
      <div v-for="(item, index) in files" :key="index" class="file text-subtitle-2 kubegems__text">
        <!-- <div class="float-left"> 2022-04-23 12:12:12 CST </div>
      <div class="float-left file__size">11 KiB</div> -->
        <div class="float-left file__item">
          <v-icon color="primary">mdi-file</v-icon>
          {{ item.filename }}
        </div>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <div v-else class="text-center text-body-2 kubegems__text">{{ $root.$t('data.no_data') }}</div>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';

  import { getModelVersionContent } from '@/api';

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
          if (newValue && newValue.v) {
            this.modelVersionContent();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelVersionContent() {
        const data = await getModelVersionContent(this.item.source, Base64.encode(this.item.name), this.item.v);
        this.files = data.files || [];
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

    &__item {
      line-height: 25px;
    }
  }
</style>
