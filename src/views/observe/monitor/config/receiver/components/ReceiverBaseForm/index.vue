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
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.receiver')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$root.$t('resource.receiver')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <ChannelForm
        ref="channelForm"
        :config-index="configIndex"
        :edit="edit"
        :namespace="namespace"
        :obj="obj"
        :type="type"
        @addData="addData"
        @closeOverlay="closeExpand"
        @updateData="updateData"
      />
      <BaseSubTitle :title="$t('tip.alert_channel')" />
      <v-card-text class="pa-2">
        <ChannelItem :obj="obj" @expandCard="expandCard" @removeConfig="removeConfig" @updateConfig="updateConfig" />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../i18n';
  import ChannelForm from './ChannelForm';
  import ChannelItem from './ChannelItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'ReceiverBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      ChannelForm,
      ChannelItem,
    },
    mixins: [BaseResource, BaseSelect],
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
    data: () => ({
      valid: false,
      expand: false,
      obj: {
        name: '',
        webhookConfigs: [],
        emailConfigs: [],
      },
      namespace: '',
      type: null,
      configIndex: null,
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          selectorRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler: function () {
          if (this.item) {
            this.obj = this.item;
            this.namespace = this.$route.query.namespace;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      addData(receiverType, data) {
        switch (receiverType) {
          case 'Email':
            if (!this.obj.emailConfigs) {
              this.$set(this.obj, 'emailConfigs', []);
            }
            this.obj.emailConfigs.push({ ...data });
            break;
          case 'Webhook':
            if (!this.obj.webhookConfigs) {
              this.$set(this.obj, 'webhookConfigs', []);
            }
            this.obj.webhookConfigs.push({ ...data });
            break;
        }
      },
      updateData(receiverType, index, config) {
        switch (receiverType) {
          case 'Email':
            this.$set(this.obj.emailConfigs, index, { ...config });
            break;
          case 'Webhook':
            this.$set(this.obj.webhookConfigs, index, { ...config });
            break;
        }
      },
      removeConfig(receiverType, index) {
        switch (receiverType) {
          case 'Email':
            this.$delete(this.obj.emailConfigs, index);
            break;
          case 'Webhook':
            this.$delete(this.obj.webhookConfigs, index);
            break;
        }
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.channelForm.expandCard();
          this.expand = true;
        });
      },
      updateConfig(type, index) {
        this.type = type;
        this.configIndex = index;
        this.$nextTick(() => {
          this.$refs.channelForm.expandCard();
          this.expand = true;
          this.$refs.channelForm.init();
        });
      },
      closeExpand() {
        this.expand = false;
        // 重置类型选择组件只读属性
        this.type = null;
      },
      reset() {
        this.$refs.channelForm.closeCard();
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      validate() {
        let channelLenth = 0;
        if (this.obj.webhookConfigs && this.obj.webhookConfigs.length > 0) {
          channelLenth++;
        }
        if (this.obj.emailConfigs && this.obj.emailConfigs.length > 0) {
          channelLenth++;
        }
        if (channelLenth === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.add_alert_channel'),
            color: 'warning',
          });
          return false && this.$refs.form.validate(true);
        } else {
          return true && this.$refs.form.validate(true);
        }
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
