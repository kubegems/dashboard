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
    <v-form ref="form" v-model="valid" lazy-validation>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('resource.channel')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-switch v-model="sendResolved" class="mt-5" hide-details :label="$t('tip.send_resolved')" />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="channelType"
              class="my-0"
              color="primary"
              hide-selected
              :items="channelTypeItems"
              :label="$t('resource.channel')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              required
              :rules="objRules.channelRule"
              value="port"
              @change="onChannelTypeChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" small>
                  <BaseLogo class="mr-2" :icon-name="item.value" :ml="0" :mt="1" :width="20" />
                  {{ item['text'] }}
                </v-chip>
              </template>
              <template #item="{ item }">
                <BaseLogo class="mr-2" :icon-name="item.value" :ml="0" :mt="2" :width="18" />
                {{ item.text }}
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <component :is="channelType" :ref="channelType" :data="obj" :edit="edit" />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AliyunMsg from './AliyunMsg';
  import AliyunVoice from './AliyunVoice';
  import Dingding from './Dingding';
  import Email from './Email';
  import Feishu from './Feishu';
  import Webhook from './Webhook';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ChannelBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      AliyunMsg,
      AliyunVoice,
      Dingding,
      Email,
      Feishu,
      Webhook,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        sendResolved: false,
        obj: {
          name: '',
          channelConfig: {
            sendResolved: false,
          },
        },
        channelType: null,
      };
    },
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required],
          channelRule: [required],
        };
      },
      channelTypeItems() {
        return [
          { text: 'Email', value: 'Email' },
          { text: 'Webhook', value: 'Webhook' },
          { text: this.$t('tip.feishu'), value: 'Feishu' },
          { text: this.$t('tip.aliyun_msg'), value: 'AliyunMsg' },
          { text: this.$t('tip.aliyun_voice'), value: 'AliyunVoice' },
          { text: this.$t('tip.dingding'), value: 'Dingding' },
        ];
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.sendResolved = newValue.channelConfig?.sendResolved;
            this.channelType = `${this.obj.channelConfig.channelType[0].toLocaleUpperCase()}${this.obj.channelConfig.channelType.substr(
              1,
            )}`;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onChannelTypeChange() {
        if (this.channelType === 'Webhook' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'webhook',
            insecureSkipVerify: true,
            url: '',
            sendResolved: false,
          };
        } else if (this.channelType === 'Feishu' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'feishu',
            signSecret: '',
            url: '',
            at: '',
            sendResolved: false,
          };
        } else if (this.channelType === 'Email' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'email',
            authPassword: '',
            requireTLS: false,
            smtpServer: '',
            to: '',
            sendResolved: false,
          };
        } else if (this.channelType === 'AliyunMsg' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'aliyunMsg',
            accessKeyId: '',
            accessKeySecret: '',
            phoneNumbers: '',
            signName: '',
            templateCode: '',
            sendResolved: false,
          };
        } else if (this.channelType === 'AliyunVoice' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'aliyunVoice',
            accessKeyId: '',
            accessKeySecret: '',
            callNumber: '',
            ttsCode: '',
            sendResolved: false,
          };
        } else if (this.channelType === 'Dingding' && !this.edit) {
          this.obj.channelConfig = {
            channelType: 'dingding',
            url: '',
            atMobiles: '',
            signSecret: '',
            sendResolved: false,
          };
        }
      },
      getData() {
        if (this.$refs[this.channelType]) {
          const data = this.$refs[this.channelType].getData();
          data.channelConfig.sendResolved = this.sendResolved;
          return data;
        }
        return null;
      },
      reset() {
        this.$refs.form.resetValidation();
        if (this.$refs[this.channelType]) {
          this.$refs[this.channelType].reset();
        }
        this.obj = this.$options.data().obj;
        this.channelType = null;
      },
      validate() {
        return (
          this.$refs.form.validate(true) && this.$refs[this.channelType] && this.$refs[this.channelType].validate()
        );
      },
      setData(data) {
        this.sendResolved = data.channelConfig?.sendResolved;
        this.obj = data;
      },
    },
  };
</script>
