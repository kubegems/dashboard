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
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-card class="my-2 pa-2" flat>
      <v-card-text class="pa-0">
        <v-sheet class="pt-2 px-0">
          <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
            <span>{{ $t('tip.feishu') }}</span>
          </v-flex>
          <v-flex class="float-left ml-0 kubegems__long-width">
            <v-text-field
              v-model="feishuConfig.url"
              class="my-0"
              label="URL"
              required
              :rules="feishuConfigRules.urlRule"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-sheet class="pt-2 px-0">
          <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width" />
          <v-flex class="float-left ml-0 kubegems__long-width">
            <v-autocomplete
              v-model="at"
              class="my-0"
              color="primary"
              hide-selected
              :items="atItems"
              :label="$t('form.user_id')"
              multiple
              :no-data-text="$root.$t('data.no_data')"
              :rules="feishuConfigRules.toRule"
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
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
        <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'FeishuForm',
    i18n: {
      messages: messages,
    },
    props: {
      configIndex: {
        type: Number,
        default: () => null,
      },
      data: {
        type: Object,
        default: () => {},
      },
      obj: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        at: [],
        atItems: [],
        atText: '',
        feishuConfigCopy: {},
        feishuConfig: {
          type: 'feishu',
          url: '',
          at: '',
        },
        feishuConfigRules: {
          urlRule: [required],
          atRule: [required],
        },
      };
    },
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
    },
    watch: {
      data() {
        this.feishuConfigCopy = deepCopy(this.data.feishuConfig);
      },
    },
    methods: {
      // 更新时调用
      init() {
        this.feishuConfig = deepCopy(this.obj.alertProxyConfigs[this.configIndex]);
        this.at = this.feishuConfig.at.split(',');
        this.atItems = this.at.map((a) => {
          return { text: a, value: a };
        });
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.feishuConfig.at = this.at.join(',');
          this.$emit('addData', deepCopy(this.feishuConfig));
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeCard');
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
    },
  };
</script>
