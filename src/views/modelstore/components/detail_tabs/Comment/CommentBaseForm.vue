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
  <v-flex>
    <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.comment')])" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-row>
          <v-col v-if="!reply" cols="12">
            <label class="v-label theme--light">{{ $t('tip.user_comment') }}</label>
            <v-rating
              v-model="obj.rating"
              background-color="orange lighten-3"
              color="orange"
              dense
              :rules="objRules.ratingRules"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="obj.content"
              auto-grow
              :label="reply ? $t('operate.reply_c', [$t('tip.comment')]) : $t('tip.comment')"
              :rules="objRules.contentRules"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import messages from '../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'CommentBaseForm',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      reply: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          rating: 0,
          content: '',
          postID: '',
          replyID: '',
        },
        objRules: {
          ratingRules: [required],
          contentRules: [required],
        },
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.setData(newValue);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      setData(data) {
        this.obj = deepCopy(data);
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
