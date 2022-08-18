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
  <BaseDialog v-model="dialog" icon="mdi-label" :title="$t('tip.label')" :width="500" @reset="reset">
    <template #content>
      <v-flex>
        <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.label')])" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="obj.tags"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="tagItems"
                  :label="$t('tip.label')"
                  multiple
                  :no-data-text="$root.$t('data.no_data')"
                  :rules="objRules.tagsRules"
                  :search-input.sync="tagText"
                  @keyup.enter="createTag"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item['text'] }}
                      <v-icon right small @click="removeTag(item.text)">mdi-close</v-icon>
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateTag">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { putAdminUpdateModel } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'TagModel',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        valid: false,
        tagItems: [],
        tagText: '',
        obj: {
          tags: [],
        },
        objRules: {
          tagsRules: [required],
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
      async updateTag() {
        if (this.$refs.form.validate(true)) {
          const data = this.obj;
          await putAdminUpdateModel(this.$route.params.name, Base64.encode(data.name), data);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = deepCopy(item);
        this.tagItems = item.tags
          ? item.tags.map((t) => {
              return { text: t, value: t };
            })
          : [];
      },
      reset() {
        this.dialog = false;
        this.obj = this.$options.data().obj;
        this.$refs.form.resetValidation();
      },
      createTag() {
        if (
          this.tagText &&
          !this.tagItems.some((i) => {
            return i.value === this.tagText;
          })
        ) {
          this.tagItems.push({ text: this.tagText, value: this.tagText });
          if (!this.obj.tags) this.obj.tags = [];
          this.obj.tags.push(this.tagText);
        }
        this.tagText = '';
      },
      removeTag(tag) {
        const index = this.obj.tags.findIndex((i) => {
          return i === tag;
        });
        if (index > -1) {
          this.obj.tags.splice(index, 1);
        }
      },
    },
  };
</script>
