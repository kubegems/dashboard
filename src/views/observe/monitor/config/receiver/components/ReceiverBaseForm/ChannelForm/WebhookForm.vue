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
            <span>Webhook</span>
          </v-flex>
          <v-flex class="float-left ml-0 kubegems__long-width">
            <v-text-field
              v-model="webhookConfig.url"
              class="my-0"
              label="URL"
              required
              :rules="webhookConfigRules.urlRule"
            />
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

  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'WebhookForm',
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
        webhookConfigsCopy: {},
        webhookConfig: {
          url: '',
        },
        webhookConfigRules: {
          urlRule: [required],
        },
      };
    },
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
    },
    watch: {
      data() {
        this.webhookConfigsCopy = deepCopy(this.data.webhookConfigs);
      },
    },
    methods: {
      // 更新时调用
      init() {
        this.webhookConfig = deepCopy(this.obj.webhookConfigs[this.configIndex]);
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.$emit('addData', deepCopy(this.webhookConfig));
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeCard');
      },
    },
  };
</script>
