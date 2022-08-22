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
              <span>{{ $t('tip.alert_severity') }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="alertLevel.severity"
                color="primary"
                hide-selected
                :items="severitySelect"
                :label="$t('tip.alert_severity')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="alertLevelRules.severityRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="alertLevel.compareOp"
                color="primary"
                hide-selected
                :items="comepareSelect"
                :label="$t('tip.trigger_condition')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="alertLevelRules.compareRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="alertLevel.compareValue"
                :label="$t('tip.trigger_val')"
                required
                :rules="alertLevelRules.compareValueRule"
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
  import messages from '../../../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required, timeInterval } from '@/utils/rules';

  export default {
    name: 'AlertLevelForm',
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
        alertLevelCopy: [],
        alertLevel: {
          index: -1,
          compareOp: '>',
          compareValue: '',
          severity: 'error',
        },
        alertLevelRules: {
          nameRule: [required],
          metricRule: [required],
          forRule: [timeInterval],
          compareRule: [required],
          severityRule: [required],
          compareValueRule: [required],
        },
      };
    },
    computed: {
      comepareSelect() {
        return [
          { text: this.$t('tip.gt'), value: '>' },
          { text: this.$t('tip.gte'), value: '>=' },
          { text: this.$t('tip.lt'), value: '<' },
          { text: this.$t('tip.lte'), value: '<=' },
          { text: this.$t('tip.eq'), value: '==' },
          { text: this.$t('tip.neq'), value: '!=' },
        ];
      },
      severitySelect() {
        return [
          { text: this.$t('tip.error'), value: 'error' },
          { text: this.$t('tip.critical'), value: 'critical' },
        ];
      },
    },
    watch: {
      data() {
        this.alertLevelCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.alertLevelCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.alertLevel = data;
        this.expand = true;
        this.$refs.form.resetValidation();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (this.alertLevel.index === -1) {
            const alertLevel = {
              compareOp: this.alertLevel.compareOp,
              compareValue: this.alertLevel.compareValue + '',
              severity: this.alertLevel.severity,
            };
            this.alertLevelCopy.push(alertLevel);
          } else {
            const alertLevel = this.alertLevelCopy[this.alertLevel.index];
            alertLevel.compareOp = this.alertLevel.compareOp;
            alertLevel.compareValue = this.alertLevel.compareValue + '';
            alertLevel.severity = this.alertLevel.severity;
            this.$set(this.alertLevelCopy, this.alertLevel.index, alertLevel);
          }
          this.$emit('addData', this.alertLevelCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.alertLevel.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
      setAlertLevel(data) {
        this.alertLevel = Object.assign(this.alertLevel, data);
      },
    },
  };
</script>
