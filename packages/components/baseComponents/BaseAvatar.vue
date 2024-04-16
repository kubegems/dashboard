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
  <div>
    <input
      id="avatar"
      accept="image/png, image/jpeg, image/gif, image/svg"
      class="filepond"
      name="filepond"
      type="file"
    />

    <v-dialog v-model="state.dialog" height="600" :overlay-opacity="0.3" persistent scrollable width="800">
      <v-card>
        <v-card-title class="primary--text">{{ i18nLocal.t('tip.cut_avatar') }}</v-card-title>
        <v-card-text class="rounded">
          <VueCropper
            ref="cropper"
            :aspect-ratio="1"
            :auto-crop-area="0.7"
            drag-mode="none"
            :scalable="false"
            :src="image"
            :zoomable="false"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="getFile">{{ i18n.t('operate.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import * as FilePond from 'filepond';
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
  import FilePondPluginImageEdit from 'filepond-plugin-image-edit';
  import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
  import FilePondPluginImageResize from 'filepond-plugin-image-resize';
  import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
  import { onMounted, watch, ref, reactive } from 'vue';
  import VueCropper from 'vue-cropperjs';

  import { useI18n } from './i18n';

  import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
  import 'filepond/dist/filepond.min.css';
  import 'filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css';
  import 'cropperjs/dist/cropper.css';

  const props = withDefaults(
    defineProps<{
      server?: string;
      cover?: string;
    }>(),
    {
      server: void 0,
      cover: '',
    },
  );

  const state = reactive({
    dialog: false,
  });

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const image = ref(void 0);

  FilePond.registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginImageEdit,
  );

  const emit = defineEmits(['success', 'error', 'input', 'change']);

  const cropper = ref(void 0);
  const fileBlob = ref(void 0);
  const getFile = () => {
    cropper.value
      .getCroppedCanvas({
        imageSmoothingQuality: 'high',
      })
      .toBlob((blob) => {
        fileBlob.value = blob;
        filepond.value.files = [fileBlob.value];
        image.value = '';
        state.dialog = false;
      });
  };

  const filepond = ref(void 0);
  onMounted(() => {
    filepond.value = FilePond.create(document.querySelector('#avatar'), {
      labelIdle: `<span class="filepond--label-action">${i18n.t('tip.file_upload')}</span>`,
      imagePreviewHeight: 170,
      imageCropAspectRatio: '1:1',
      imageResizeTargetWidth: 200,
      imageResizeTargetHeight: 200,
      stylePanelLayout: 'compact circle',
      styleLoadIndicatorPosition: 'center bottom',
      styleProgressIndicatorPosition: 'center bottom',
      styleButtonRemoveItemPosition: 'left bottom',
      styleButtonProcessItemPosition: 'right bottom',
      maxFileSize: '2MB',
      allowFileSizeValidation: true,
      instantUpload: false,
      server: {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
          const formData = new FormData();
          formData.append('avatar', file);

          const request = new XMLHttpRequest();

          request.open('POST', props.server);

          request.setRequestHeader(
            'Authorization',
            `Bearer ${store.state.JWT || store.state.IdToken || store.state.AccessToken}`,
          );

          request.upload.onprogress = (e) => {
            progress(e.lengthComputable, e.loaded, e.total);
          };

          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              load(request.responseText);
              emit('success');
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

    document.addEventListener('FilePond:addfile', async (e: any) => {
      if (e.detail.error) {
        store.commit('SET_SNACKBAR', {
          text: `${e.detail.error.main || ''} ${e.detail.error.sub || ''}`,
          color: 'warning',
        });
        filepond.value.files = [];
        return;
      }
      const base64 = await fileToBase64(e?.detail?.file?.file);
      image.value = `data:image/png;base64, ${base64}`;
      emit('input', e?.detail?.file?.file);
      emit('change', e?.detail?.file?.file);
      if (new RegExp('^\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}$', 'g').test(e?.detail?.file?.filename)) {
        state.dialog = false;
      } else {
        state.dialog = true;
      }
    });

    document.addEventListener('FilePond:removefile', async () => {
      emit('input', void 0);
      emit('change', void 0);
      state.dialog = false;
    });
  });

  const fileToBase64 = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        const base64String = (reader.result as any)?.split(',')?.[1];
        resolve(base64String);
      };

      reader.onerror = function () {
        reject(new Error('Failed to load file'));
      };
    });
  };

  watch(
    () => props.cover,
    (newVal) => {
      if (newVal) {
        const interval = setInterval(() => {
          const ele = document.querySelector('.filepond--panel');
          if (ele) {
            (ele as any).style.backgroundImage = `url(${newVal})`;
            (ele as any).style.backgroundRepeat = `round`;
            clearInterval(interval);
          }
        }, 100);
      }
    },
    { deep: true, immediate: true },
  );
</script>

<style>
  .filepond--drop-label {
    color: #4c4e53;
  }

  .filepond--label-action {
    text-decoration-color: #babdc0;
  }

  .filepond--panel-root {
    background-color: #edf0f4;
  }

  .filepond--root {
    width: 150px;
    margin: 0 auto;
  }
</style>
