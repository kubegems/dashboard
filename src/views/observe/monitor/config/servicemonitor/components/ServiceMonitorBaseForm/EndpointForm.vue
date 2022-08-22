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
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $root.$t('form.definition', [$t('tip.endpoint')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="portSelector"
                class="my-0"
                color="primary"
                hide-selected
                :items="portSelect"
                :label="$t('tip.port_type')"
                :no-data-text="$root.$t('data.no_data')"
                required
                :rules="endpointRules.typeRule"
                value="port"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex v-if="portSelector === 'port'" class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="endpoint.port"
                class="my-0"
                :label="$t('table.port_name')"
                required
                :rules="endpointRules.portRules"
              />
            </v-flex>
            <v-flex v-if="portSelector === 'targetPort'" class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="endpoint.targetPort"
                class="my-0"
                :label="$t('table.port_number')"
                required
                :rules="endpointRules.targetPortRules"
                type="number"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="endpoint.path" class="my-0" :label="$t('table.path')" required />
            </v-flex>
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="endpoint.interval"
                class="my-0"
                :label="$t('table.interval')"
                required
                :rules="endpointRules.intervalRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="endpoint.scrapeTimeout"
                class="my-0"
                :label="$t('table.timeout')"
                required
                :rules="endpointRules.scrapeTimeoutRule"
              />
            </v-flex>
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-switch
                v-model="honorLabel"
                class="mt-4"
                hide-details
                :label="$t('table.metric_first')"
                @change="onHonorLabelChange"
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
  import messages from '../../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required, timeInterval } from '@/utils/rules';

  export default {
    name: 'EndpointForm',
    i18n: {
      messages: messages,
    },
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
        endpointsCopy: {},
        endpoint: {
          index: -1,
          port: null,
          targetPort: null,
          path: null,
          interval: null,
          scrapeTimeout: null,
          honorLabels: true,
        },
        portSelector: 'port',
        honorLabel: true,
        endpointRules: {
          typeRule: [required],
          portRules: [required],
          targetPortRules: [required],
          intervalRule: [timeInterval],
          scrapeTimeoutRule: [timeInterval],
        },
      };
    },
    computed: {
      portSelect() {
        return [
          { text: this.$t('table.port_name'), value: 'port' },
          { text: this.$t('table.port_number'), value: 'targetPort' },
        ];
      },
    },
    watch: {
      data() {
        this.endpointsCopy = deepCopy(this.data);
        this.honorLabel = this.endpointsCopy.honorLabels;
      },
    },
    mounted() {
      if (this.data) {
        // 如果父组件传递了属性
        this.endpointsCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.endpoint = data;
        this.honorLabel = this.endpoint.honorLabels;
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (this.endpoint.index === -1) {
            const endpoint = {
              path: this.endpoint.path,
              interval: this.endpoint.interval,
              scrapeTimeout: this.endpoint.scrapeTimeout,
              honorLabels: this.endpoint.honorLabels,
            };
            if (this.portSelector === 'port') {
              endpoint.port = this.endpoint.port;
            } else {
              endpoint.targetPort = this.endpoint.targetPort;
            }
            this.endpointsCopy.push(endpoint);
          } else {
            const endpoint = this.endpointsCopy[this.endpoint.index];
            endpoint.path = this.endpoint.path;
            endpoint.interval = this.endpoint.interval;
            endpoint.scrapeTimeout = this.endpoint.scrapeTimeout;
            endpoint.honorLabels = this.endpoint.honorLabels;
            if (this.portSelector === 'port') {
              endpoint.port = this.endpoint.port;
              delete endpoint.targetPort;
            } else {
              endpoint.targetPort = this.endpoint.targetPort;
              delete endpoint.port;
            }
            this.$set(this.endpointsCopy, this.endpoint.index, endpoint);
          }
          this.$emit('addData', this.endpointsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.endpoint.index = -1;
        this.$emit('closeOverlay');
      },
      onHonorLabelChange() {
        this.$set(this.endpoint, 'honorLabels', this.honorLabel);
      },
      expandCard() {
        this.expand = true;
      },
      setPortSelector(data) {
        this.portSelector = data;
      },
    },
  };
</script>
