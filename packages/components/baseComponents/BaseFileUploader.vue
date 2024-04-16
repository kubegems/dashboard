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
    :accepted-file-types="fileTypes.join(',')"
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
    max-parallel-uploads="2"
  />
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import { nextTick, onMounted } from 'vue';
  import vueFilePond from 'vue-filepond';

  import 'filepond/dist/filepond.min.css';

  const FilePond = vueFilePond(FilePondPluginFileValidateType);
  const i18n = useGlobalI18n();

  withDefaults(
    defineProps<{
      previewHeight?: number;
      fileTypes?: string[];
    }>(),
    {
      previewHeight: 500,
      fileTypes: () => [],
    },
  );

  const emits = defineEmits(['addfile', 'removefile']);
  onMounted(() => {
    nextTick(() => {
      document.addEventListener('FilePond:addfile', (e: any) => {
        emits('addfile', e?.detail?.file?.file);
      });

      document.addEventListener('FilePond:removefile', (e: any) => {
        emits('removefile', e?.detail?.file?.file);
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
