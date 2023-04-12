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
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
              <span>{{ $root.$t('form.definition', [$root.$t('resource.receiver')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.alertChannelID"
                color="primary"
                hide-selected
                :items="receiverItems"
                :label="$root.$t('resource.receiver')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="objRules.idRule"
                @change="onReceiverChange"
                @focus="onReceiverSelectFocus"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.interval"
                :label="$t('tip.send_interval')"
                required
                :rules="objRules.intervalRule"
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
  import { getChannelList } from '@kubegems/api/direct';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { required, timeInterval } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import BaseFilter from '@kubegems/mixins/base_filter';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapGetters } from 'vuex';

  import messages from '../../../../../i18n';

  export default {
    name: 'ReceiverForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    props: {
      data: {
        type: Array,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        receiverCopy: {},
        obj: {
          index: -1,
          alertChannelID: 0,
          alertChannel: {
            name: '',
          },
          interval: '',
        },
        objRules: {
          idRule: [required],
          intervalRule: [timeInterval],
        },
        receiverItems: [],
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    watch: {
      data() {
        this.receiverCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.receiverCopy = deepCopy(this.data);
      }
    },
    methods: {
      // 编辑时调用
      async init(data) {
        this.obj = data;
        await this.receiverList();
        this.expand = true;
      },
      async receiverList() {
        const data = await getChannelList(this.Tenant().ID, {
          size: 100,
        });
        this.receiverItems = convertResponse2List(data).map((item) => {
          return {
            text: `${item.name}(${item.channelConfig.channelType})`,
            value: item.id,
          };
        });
      },
      onReceiverSelectFocus() {
        this.receiverList();
      },
      onReceiverChange() {
        const alertChannel = this.receiverItems.find((r) => {
          return r.value === this.obj.alertChannelID;
        });
        if (alertChannel) {
          this.obj.alertChannel.name = alertChannel.text;
        }
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (this.obj.index === -1) {
            const receiver = {
              alertChannelID: this.obj.alertChannelID,
              alertChannel: {
                name: this.obj.alertChannel.name,
              },
              interval: this.obj.interval,
            };
            this.receiverCopy.push(receiver);
          } else {
            const receiver = this.receiverCopy[this.obj.index];
            receiver.alertChannel = {
              name: this.obj.alertChannel.name,
            };
            receiver.alertChannelID = this.obj.alertChannelID;
            receiver.interval = this.obj.interval;
            this.$set(this.receiverCopy, this.obj.index, receiver);
          }
          this.$emit('addData', this.receiverCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.obj.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
