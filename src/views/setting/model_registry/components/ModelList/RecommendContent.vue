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
  <BaseDialog v-model="dialog" icon="mdi-content-copy" title="模型推荐内容" :width="1000" @reset="reset">
    <template #content>
      <v-flex>
        <BaseSubTitle title="推荐内容定义" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <QuillEditor v-model="obj.recommentContent" :options="editorOption" @keydown.stop />
            </v-col>
          </v-row>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateRecommentContent"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { quillEditor } from 'vue-quill-editor';
  import { mapState } from 'vuex';

  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';
  import { putAdminUpdateModel } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'RecommendContent',
    components: {
      QuillEditor: quillEditor,
    },
    data() {
      return {
        dialog: false,
        obj: {
          recommentContent: '',
        },
        editorOption: {
          placeholder: '模型推荐内容',
          theme: 'snow',
        },
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateRecommentContent() {
        const data = this.obj;
        await putAdminUpdateModel(this.$route.params.name, Base64.encode(data.name), data);
        this.reset();
        this.$emit('refresh');
      },
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>

<style lang="scss">
  .ql-editor {
    height: 400px;
  }
</style>
