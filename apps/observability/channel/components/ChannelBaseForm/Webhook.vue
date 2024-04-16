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
      <v-col>
        <v-switch v-model="obj.channelConfig.insecureSkipVerify" hide-details :label="$t('tip.skip_verify')" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';

  import messages from '../../i18n';

  export default {
    name: 'Webhook',
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
        obj: {},
        objRules: {
          urlRule: [required],
        },
      };
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
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
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
