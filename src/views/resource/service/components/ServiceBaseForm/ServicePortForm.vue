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
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $root.$t('form.definition', [$t('tip.port')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="port.name" class="my-0" label="名称" required :rules="portRules.nameRule" />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="port.targetPort"
                class="my-0"
                :label="$t('tip.container_port')"
                required
                :rules="portRules.targetPortRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="port.port"
                class="my-0"
                :label="$t('tip.service_port')"
                required
                :rules="portRules.portRule"
                type="number"
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
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'ServicePortForm',
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
        portsCopy: {},
        port: {
          index: -1,
          name: '',
          protocol: 'TCP',
          port: '',
          targetPort: '',
        },
        portRules: {
          nameRule: [
            (v) =>
              !!new RegExp(
                '^(http)([-\\w]+)?$|^(https)([-\\w]+)?$|^(http2)([-\\w]+)?$|^(grpc)([-\\w]+)?$|^(tcp)([-\\w]+)?$|^(udp)([-\\w]+)?$|^(tls)([-\\w]+)?$|^(mongo)([-\\w]+)?$|^(mysql)([-\\w]+)?$|^(redis)([-\\w]+)?$',
                'g',
              ).test(v) || this.$t('form.name_rule'),
          ],
          portRule: [required],
          targetPortRule: [required],
          sessionRule: [positiveInteger, (v) => !!parseInt(v) > 86400 || this.$t('form.limit_max_rule')],
        },
      };
    },
    watch: {
      data() {
        this.portsCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.portsCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.port = data;
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.portsCopy) this.portsCopy = [];
          if (this.port.index === -1) {
            this.portsCopy.push({
              name: this.port.name,
              protocol: this.port.protocol,
              port: this.port.port,
              targetPort: this.port.targetPort,
            });
          } else {
            const port = this.portsCopy[this.port.index];
            port.name = this.port.name;
            port.protocol = this.port.protocol;
            port.port = this.port.port;
            port.targetPort = this.port.targetPort;
            this.$set(this.portsCopy, this.port.index, port);
          }
          this.$emit('addData', this.portsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.port = deepCopy(this.$options.data().port);
        this.$refs.form.resetValidation();
        this.$emit('closeOverlay');
      },
    },
  };
</script>
