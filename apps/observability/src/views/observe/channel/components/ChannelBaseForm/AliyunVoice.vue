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
      <v-col cols="6">
        <v-text-field
          v-model="obj.channelConfig.accessKeyId"
          class="my-0"
          label="AccessKeyId"
          required
          :rules="objRules.accessKeyIdRule"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="obj.channelConfig.accessKeySecret"
          :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          class="my-0"
          label="AccessKeySecret"
          required
          :rules="objRules.accessKeySecretRule"
          :type="show ? 'text' : 'password'"
          @click:append="show = !show"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="obj.channelConfig.ttsCode"
          class="my-0"
          label="TTSCode"
          required
          :rules="objRules.ttsCodeRule"
        />
      </v-col>
      <v-col cols="6">
        <v-autocomplete
          v-model="phoneTo"
          class="my-0"
          color="primary"
          hide-selected
          :items="phoneToItems"
          :label="$t('tip.phone')"
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.callNumberRule"
          :search-input.sync="phoneText"
          @focus="usePhoneList"
          @keydown.13="createPhone"
        >
          <template #selection="{ item }">
            <v-chip
              class="mx-1"
              close
              close-icon="mdi-close-circle"
              color="primary"
              small
              @click:close="removePhone(item)"
            >
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { getTenantUserList } from '@kubegems/api/direct';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapGetters } from 'vuex';

  import messages from '../../i18n';

  export default {
    name: 'AliyunVoiceForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },

    data() {
      return {
        valid: false,
        show: false,
        obj: {},
        objRules: {
          accessKeyIdRule: [required],
          accessKeySecretRule: [required],
          ttsCodeRule: [required],
          callNumberRule: [required],
        },
        phoneToItems: [],
        phoneTo: [],
        phoneText: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            const phones = this.obj.channelConfig.callNumber.split(',').filter((t) => {
              return Boolean(t);
            });
            this.phoneTo = phones[0];
            this.phoneToItems = this.phoneToItems.concat(
              phones.map((e) => {
                return { text: e, value: e };
              }),
            );
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
        this.phoneListToString();
        return this.obj;
      },
      async usePhoneList() {
        const data = await getTenantUserList(this.Tenant().ID, {
          size: 500,
        });
        this.phoneToItems = this.phoneToItems
          .concat(
            convertResponse2List(data)
              .filter((user) => {
                return user.Phone && user.Phone && user.Phone.length > 0;
              })
              .map((user) => {
                if (
                  !this.phoneToItems.some((e) => {
                    return e && e.text === user.Phone;
                  })
                ) {
                  return { text: user.Phone, value: user.Phone };
                }
              }),
          )
          .filter((e) => {
            return Boolean(e);
          });
      },
      createPhone() {
        if (!this.phoneText.trim()) return;
        if (!new RegExp('^\\d{11}$').test(this.phoneText)) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('ruler.mobile'),
            color: 'warning',
          });
          return;
        }
        if (
          !this.phoneToItems.some((to) => {
            return to.value === this.phoneText.trim();
          })
        ) {
          this.phoneToItems.push({
            text: this.phoneText.trim(),
            value: this.phoneText.trim(),
          });
          this.phoneTo = this.phoneText.trim();
        }
        this.phoneText = '';
      },
      removePhone(item) {
        const index = this.phoneTo?.findIndex((phone) => {
          return phone === item.text;
        });
        if (index > -1) {
          this.phoneTo?.splice(index, 1);
        }
      },
      phoneListToString() {
        if (this.phoneTo?.length > 0) {
          this.obj.channelConfig.callNumber = this.phoneTo;
        } else {
          this.obj.channelConfig.callNumber = '';
        }
      },
      reset() {
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
