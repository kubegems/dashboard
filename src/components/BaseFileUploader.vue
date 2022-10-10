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
    bottom
    :close-delay="200"
    :close-on-content-click="false"
    nudge-bottom="5px"
    offset-y
    open-on-click
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn color="white" icon text v-on="on">
        <v-icon>mdi-upload</v-icon>
      </v-btn>
    </template>
    <v-card flat width="350">
      <v-card-text class="pa-3">
        <div class="uploader__title mb-2"> {{ $root.$t('operate.upload') }} </div>
        <div class="uploader__title mb-2">
          {{ $root.$t('tip.dest_dir') }} : {{ dist }}
          <div class="orange--text">
            <v-icon color="orange" small> mdi-information-variant </v-icon>
            {{ $root.$t('tip.path_tip') }}
          </div>
        </div>
        <FilePond
          ref="filePond"
          allow-multiple="true"
          credits="false"
          :files="files"
          :label-idle="$root.$t('tip.file_upload')"
          max-files="5"
          @init="onFilePondInit"
        />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import vueFilePond, { setOptions } from 'vue-filepond';

  import store from '@/store';
  import { getQueryString } from '@/utils/helpers';

  import 'filepond/dist/filepond.min.css';

  let destDir = '/';
  const FilePond = vueFilePond(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);
  setOptions({
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const formData = new FormData();
        formData.append('files[]', file);
        formData.append('dest', `${destDir}`);

        const request = new XMLHttpRequest();
        request.open(
          'POST',
          `/api/v1/proxy/cluster/${getQueryString('t_cluster')}/custom/core/v1/namespaces/${getQueryString(
            't_namespace',
          )}/pods/${getQueryString('t_pod')}/actions/upfile`,
        );
        request.setRequestHeader('Authorization', `Bearer ${store.state.JWT}`);

        // Should call the progress method to update the progress to 100% before calling load
        // Setting computable to false switches the loading indicator to infinite mode
        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        // Should call the load method when done and pass the returned server file id
        // this server file id is then used later on when reverting or restoring a file
        // so your server knows which file to return without exposing that info to the client
        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            // the load method accepts either a string (id) or an object
            load(request.responseText);
          } else {
            // Can call the error method if something is wrong, should exit after
            error('oh no');
          }
        };

        request.send(formData);

        // Should expose an abort method so the request can be cancelled
        return {
          abort: () => {
            // This function is entered if the user has tapped the cancel button
            request.abort();

            // Let FilePond know the request has been cancelled
            abort();
          },
        };
      },
      revert: null,
    },
  });

  export default {
    name: 'BaseFileUploader',
    components: {
      FilePond,
    },
    props: {
      dist: {
        type: String,
        default: () => '/',
      },
    },
    data() {
      return { files: [] };
    },
    watch: {
      dist: {
        handler(newValue) {
          if (newValue) {
            destDir = this.dist;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onFilePondInit() {},
      reset() {
        if (this.$refs.filePond) this.$refs.filePond.removeFiles();
        destDir = '/';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .uploader {
    &__title {
      font-size: 13px;
      font-weight: 500;
    }
  }
</style>
