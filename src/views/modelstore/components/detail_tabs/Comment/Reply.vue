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
  <BaseDialog v-model="dialog" icon="mdi-comment" :title="title" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" :reply="reply" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addComment">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import CommentBaseForm from './CommentBaseForm';
  import { postModelComment, putModelComment } from '@/api';

  export default {
    name: 'Reply',
    components: {
      CommentBaseForm,
    },
    data() {
      return {
        dialog: false,
        title: '',
        formComponent: 'CommentBaseForm',
        reply: false,
        item: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open(title) {
        this.dialog = true;
        this.title = title;
      },
      async addComment() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (data.id) {
            await putModelComment(this.$route.query.registry, Base64.encode(this.$route.params.name), data.id, data);
          } else {
            await postModelComment(this.$route.query.registry, Base64.encode(this.$route.params.name), data);
          }
          this.reset();
          this.$emit('refresh', this.reply, data?.replyTo?.rootID);
        }
      },
      init(item, reply) {
        this.reply = reply;
        this.item = item;
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
