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
    v-model="state.menu"
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
      <v-btn color="primary" text v-on="on">
        {{ i18n.t('operate.upload') }}
      </v-btn>
    </template>
    <v-card flat width="350">
      <v-card-text class="pa-3">
        <FilePond
          ref="filePond"
          allow-multiple="true"
          credits="false"
          file-pond
          :files="files"
          :label-file-processing="i18nLocal.t('tip.label_file_processing')"
          :label-file-processing-complete="i18nLocal.t('tip.label_file_processing_complete')"
          :label-file-processing-error="i18nLocal.t('tip.label_file_processing_error')"
          :label-idle="i18nLocal.t('tip.file_upload')"
          :label-tap-to-cancel="i18nLocal.t('tip.label_tap_to_cancel')"
          :label-tap-to-retry="i18nLocal.t('tip.label_tap_to_retry')"
          max-parallel-uploads="5"
        />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import { reactive, ref } from 'vue';
  import vueFilePond, { setOptions } from 'vue-filepond';

  import { useI18n } from '../i18n';

  import 'filepond/dist/filepond.min.css';

  const props = withDefaults(
    defineProps<{
      directory?: string;
    }>(),
    {
      directory: '/',
    },
  );

  const store = useStore();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const query = useQuery();

  const state = reactive({
    menu: false,
  });

  const emit = defineEmits(['refresh']);
  const files = ref([]);
  const FilePond = vueFilePond(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);
  setOptions({
    server: {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const formData = new FormData();
        formData.append('files[]', file);
        formData.append('dest', `${props.directory}`);

        const request = new XMLHttpRequest();
        if (store.state.Edge) {
          request.open(
            'POST',
            `/api/v1/edge-clusters/${query.value.t_cluster}/proxy/custom/core/v1/namespaces/${query.value.t_namespace}/pods/${query.value.t_pod}/actions/upfile?container=${query.value.t_container}`,
          );
        } else {
          request.open(
            'POST',
            `/api/v1/proxy/cluster/${query.value.t_cluster}/custom/core/v1/namespaces/${query.value.t_namespace}/pods/${query.value.t_pod}/actions/upfile?container=${query.value.t_container}`,
          );
        }
        request.setRequestHeader('Authorization', `Bearer ${store.state.JWT}`);

        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        request.onload = function () {
          if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            emit('refresh', props.directory);
          } else {
            error('error');
          }
        };

        request.send(formData);

        return {
          abort: () => {
            request.abort();
            abort();
          },
        };
      },
      revert: null,
    },
  });

  const filePond = ref(null);
  const reset = (): void => {
    if (filePond.value) filePond.value.removeFiles();
  };

  defineExpose({
    reset,
  });
</script>

<style lang="scss" scoped>
  .uploader {
    &__title {
      font-size: 13px;
      font-weight: 500;
    }
  }
</style>
