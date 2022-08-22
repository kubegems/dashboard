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
    <v-sheet v-for="(item, index) in items" :key="index" class="grey lighten-4 rounded mb-3">
      <components :is="itemMap[item.type]" :item="item" @removeConfig="removeConfig" @updateConfig="updateConfig" />
    </v-sheet>
    <v-flex>
      <v-flex class="grey lighten-4 rounded">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="expandCard">
                <v-icon left small> mdi-plus </v-icon>
                {{ $root.$t('operate.add_c', [$t('tip.alert_channel')]) }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
  import messages from '../../../../../i18n';
  import EmailItem from './EmailItem';
  import WebhookItem from './WebhookItem';

  export default {
    name: 'ChannelItem',
    i18n: {
      messages: messages,
    },
    components: {
      EmailItem,
      WebhookItem,
    },
    props: {
      obj: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      itemMap: { Email: 'EmailItem', Webhook: 'WebhookItem' },
    }),
    computed: {
      items() {
        let arr = [];
        if (this.obj.emailConfigs) {
          arr = arr.concat(
            this.obj.emailConfigs.map((item, index) => {
              return { ...item, type: 'Email', index: index };
            }),
          );
        }
        if (this.obj.webhookConfigs) {
          arr = arr.concat(
            this.obj.webhookConfigs.map((item, index) => {
              return { ...item, type: 'Webhook', index: index };
            }),
          );
        }
        return arr;
      },
    },
    methods: {
      updateConfig(type, index) {
        this.$emit('updateConfig', type, index);
      },
      removeConfig(type, index) {
        this.$emit('removeConfig', type, index);
      },
      expandCard() {
        this.$emit('expandCard', 'channelForm');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .white-space {
    white-space: normal;
  }
</style>
>
