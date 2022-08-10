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
  <div class="pa-3 white rounded mt-3">
    <v-autocomplete
      v-model="mySelectFile"
      class="mb-3"
      color="primary"
      dense
      flat
      hide-details
      hide-selected
      :items="fileName"
      :label="$root.$t('resource.file')"
      :no-data-text="$root.$t('data.no_data')"
      solo
      :style="{ width: `500px` }"
      @change="onFileChange"
    />
    <ACEEditor
      v-model="code"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
      lang="yaml"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
      :style="{ height: `${height}px !important` }"
      theme="chrome"
      @init="$aceinit"
      @keydown.stop
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'ConfigFile',
    props: {
      item: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      mySelectFile: 'values.yaml',
      code: null,
      fileName: [],
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 312 * this.Scale;
      },
    },
    watch: {
      item: {
        handler: function () {
          this.code = this.item.files[this.mySelectFile];
          for (const k in this.item.files) {
            this.fileName.push(k);
          }
        },
        immediate: true,
      },
    },
    methods: {
      onFileChange() {
        this.code = this.item.files[this.mySelectFile];
      },
    },
  };
</script>
