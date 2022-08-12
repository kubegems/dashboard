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
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$t('operate.fault_injection')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="delay"
              class="mt-4"
              hide-details
              :label="$t('form.http_delay')"
              @change="onDelayChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="delay">
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.delay.percentage.value"
              class="my-0"
              :label="$t('form.delay_precent')"
              required
              :rules="objRules.delayPercentageRule"
              type="number"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.delay.fixedDelay"
              class="my-0"
              :label="$t('form.fixed_delay')"
              required
              :rules="objRules.fixedDelayRule"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="abort"
              class="mt-4"
              hide-details
              :label="$t('form.http_abort')"
              @change="onAbortChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="abort">
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.abort.percentage.value"
              class="my-0"
              :label="$t('form.abort_precent')"
              required
              :rules="objRules.abortPercentageRule"
              type="number"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.abort.httpStatus"
              class="my-0"
              :label="$t('form.status_code')"
              required
              :rules="objRules.httpStatusRule"
              type="number"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'FaultInjectionBaseForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      vs: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      abort: false,
      delay: false,
      abortDefault: {
        httpStatus: 503,
        percentage: {
          value: 100,
        },
      },
      delayDefault: {
        fixedDelay: '5s',
        percentage: {
          value: 100,
        },
      },
      obj: {
        fault: {},
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          delayPercentageRule: [
            required,
            (v) => !!(parseInt(v) <= 100 && parseInt(v) >= 0) || this.$t('form.limit_100_rule'),
          ],
          abortPercentageRule: [
            required,
            (v) => !!(parseInt(v) <= 100 && parseInt(v) >= 0) || this.$t('form.limit_100_rule'),
          ],
          fixedDelayRule: [required, (v) => !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || this.$t('form.integer_rule')],
          httpStatusRule: [required],
        };
      },
    },
    watch: {
      vs: {
        handler: function () {
          if (this.vs) this.loadData(true);
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      loadData(cover = false) {
        this.$nextTick(() => {
          if (cover) {
            this.obj = deepCopy(this.vs);
            if (this.obj.fault.abort) this.abort = true;
            if (this.obj.fault.delay) this.delay = true;
          }
        });
      },
      reset() {
        this.$refs.form.resetValidation();
        this.abort = false;
        this.delay = false;
        this.obj = deepCopy(this.$options.data().obj);
      },
      onDelayChange() {
        if (this.delay) {
          this.obj.fault.delay = this.delayDefault;
        } else {
          this.$delete(this.obj.fault, 'delay');
        }
      },
      onAbortChange() {
        if (this.abort) {
          this.obj.fault.abort = this.abortDefault;
        } else {
          this.$delete(this.obj.fault, 'abort');
        }
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
