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
  <v-form ref="form" v-model="valid" class="ma-2" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $t('form.domain') }}</span>
            </v-flex>
            <v-flex class="float-left ml-0 kubegems__long-width">
              <v-text-field
                v-model="dnsName"
                class="my-0"
                :label="$t('form.domain')"
                required
                :rules="rules.dnsNameRules"
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
    </v-expand-transition>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { required } from '@/utils/rules';

  export default {
    name: 'DnsNameForm',
    i18n: {
      messages: messages,
    },
    data: () => ({
      valid: false,
      expand: false,
      dnsName: null,
      edit: false,
      index: null,
      rules: {
        dnsNameRules: [required],
      },
    }),
    methods: {
      init(dnsNames, index) {
        this.dnsName = dnsNames[index];
        this.edit = true;
        this.index = index;
      },
      closeCard() {
        this.$refs.form.reset();
        this.expand = false;
        this.edit = false;
        this.index = null;
        this.$emit('closeOverlay');
      },
      addData() {
        this.edit
          ? this.$emit('updateData', 'DnsName', this.dnsName, this.index)
          : this.$emit('addData', 'DnsName', this.dnsName);
        this.closeCard();
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
