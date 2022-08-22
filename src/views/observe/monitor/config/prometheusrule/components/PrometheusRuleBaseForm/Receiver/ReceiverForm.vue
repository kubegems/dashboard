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
                v-model="receiver.name"
                color="primary"
                hide-selected
                :items="receiverSelect"
                :label="$root.$t('resource.receiver')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="receiverRules.nameRule"
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
              <v-text-field v-model="receiver.interval" label="发送间隔" required :rules="receiverRules.intervalRule" />
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
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import { getReceiverList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required, timeInterval } from '@/utils/rules';

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
      mode: {
        type: String,
        default: () => 'monitor',
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        receiverCopy: {},
        receiver: {
          index: -1,
          name: '',
          interval: '',
        },
        receiverRules: {
          nameRule: [required],
          intervalRule: [timeInterval],
        },
        receiverSelect: [],
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Project', 'Environment']),
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
        this.receiver = data;
        await this.receiverList();
        this.expand = true;
      },
      async receiverList() {
        const data = await getReceiverList(this.$route.query.cluster, this.$route.query.namespace, {
          scope: this.mode,
        });
        this.receiverSelect = data.map((item) => {
          return {
            text: item.name,
            value: item.name,
          };
        });
      },
      onReceiverSelectFocus() {
        this.receiverList();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (this.receiver.index === -1) {
            const receiver = {
              name: this.receiver.name,
              interval: this.receiver.interval,
            };
            this.receiverCopy.push(receiver);
          } else {
            const receiver = this.receiverCopy[this.receiver.index];
            receiver.name = this.receiver.name;
            receiver.interval = this.receiver.interval;
            this.$set(this.receiverCopy, this.receiver.index, receiver);
          }
          this.$emit('addData', this.receiverCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.receiver.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
