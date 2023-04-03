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
  <v-form ref="form" v-model="valid" class="mt-2" lazy-validation @submit.prevent>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="obj.channelConfig.url" class="my-0" label="URL" required :rules="objRules.urlRule" />
      </v-col>
      <v-col cols="12">
        <v-switch v-model="advanced" hide-details :label="$t('tip.advanced_setting')" />
      </v-col>
      <template v-if="advanced">
        <v-col>
          <v-autocomplete
            v-model="at"
            class="my-0"
            color="primary"
            hide-selected
            :items="atItems"
            :label="$t('tip.user_id')"
            multiple
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.toRule"
            :search-input.sync="atText"
            @keydown.13="createAt"
          >
            <template #selection="{ item }">
              <v-chip
                class="mx-1"
                close
                close-icon="mdi-close-circle"
                color="primary"
                small
                @click:close="removeAt(item)"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col class="pt-8" cols="2">
          <span class="orange--text text-caption kubegems__pointer" @click="toFeishu">
            <v-icon color="orange" small> mdi-information-variant </v-icon>
            {{ $t('tip.get_feishu_id') }}
          </span>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="obj.channelConfig.signSecret" class="my-0" :label="$t('tip.sign_secret')" />
        </v-col>
      </template>
    </v-row>
  </v-form>
</template>

<script>
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { required } from '@kubegems/libs/utils/rules';

  import messages from '../../i18n';

  export default {
    name: 'FeishuForm',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        at: [],
        atItems: [],
        atText: '',
        obj: {},
        objRules: {
          urlRule: [required],
          atRule: [required],
        },
        advanced: false,
      };
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            if (this.obj.channelConfig.at?.length > 0) {
              this.at = this.obj.channelConfig.at.split(',');
              this.atItems = this.at.map((a) => {
                return { text: a, value: a };
              });
              this.advanced = true;
            }
            if (this.obj.channelConfig.signSecret) {
              this.advanced = true;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        if (this.at.length > 0) {
          this.obj.channelConfig.at = this.at.join(',');
        }
        return this.obj;
      },
      createAt() {
        if (
          !this.atItems.some((a) => {
            return a.text === this.atText.trim();
          })
        ) {
          this.atItems.push({ text: this.atText.trim(), value: this.atText.trim() });
          this.at.push(this.atText.trim());
        }
        this.atText = '';
      },
      removeAt(item) {
        const index = this.at.indexOf(item.value);
        if (index > -1) {
          this.at.splice(index, 1);
        }
      },
      toFeishu() {
        window.open('https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id');
      },
      reset() {
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
