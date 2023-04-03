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
  <FilePond
    accepted-file-types="image/png, image/jpeg, image/gif"
    allow-multiple="false"
    credits="false"
    :image-preview-height="previewHeight"
    image-review-height="previewHeight"
    instant-upload="false"
    :label-file-processing="i18n.t('tip.label_file_processing')"
    :label-file-processing-complete="i18n.t('tip.label_file_processing_complete')"
    :label-file-processing-error="i18n.t('tip.label_file_processing_error')"
    :label-idle="i18n.t('tip.file_upload')"
    :label-tap-to-cancel="i18n.t('tip.label_tap_to_cancel')"
    :label-tap-to-retry="i18n.t('tip.label_tap_to_retry')"
    max-parallel-uploads="1"
  />
</template>

<script lang="ts" setup>
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
  import { nextTick, onMounted } from 'vue';
  import vueFilePond from 'vue-filepond';

  import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
  import 'filepond/dist/filepond.min.css';
  import { useGlobalI18n } from '@kubegems/extension/i18n';

  const FilePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImagePreview);
  const i18n = useGlobalI18n();

  withDefaults(
    defineProps<{
      previewHeight?: number;
    }>(),
    {
      previewHeight: 500,
    },
  );

  const emits = defineEmits(['input']);
  onMounted(() => {
    nextTick(() => {
      document.addEventListener('FilePond:addfile', (e: any) => {
        emits('input', e?.detail?.file?.file || null);
      });
    });
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
