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
      <BaseSubTitle :title="$root.$t('form.definition', [$t('operate.request_timeout')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="timeout"
              class="mt-4"
              hide-details
              :label="$t('form.http_timeout')"
              @change="onTimeoutChange"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="timeout" cols="6">
            <v-text-field
              v-model="obj.timeout"
              class="my-0"
              :label="$t('form.timeout')"
              required
              :rules="objRules.timeoutInputRule"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="retries"
              class="mt-4"
              hide-details
              :label="$t('form.http_retry')"
              @change="onRetriesChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="retries">
          <v-col cols="6">
            <v-text-field
              v-model="obj.retries.attempts"
              class="my-0"
              :label="$t('form.attempt')"
              required
              :rules="objRules.attemptsRule"
              type="number"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.retries.perTryTimeout"
              class="my-0"
              :label="$t('form.try_timeout')"
              required
              :rules="objRules.perTryTimeoutRule"
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
    name: 'RequestTimeoutsBaseForm',
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
      retries: false,
      timeout: false,
      retriesDefault: {
        attempts: 3,
        perTryTimeout: '2s',
      },
      timeoutDefault: '2s',
      obj: {},
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          timeoutInputRule: [required, (v) => !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || this.$t('from.integer_rule')],
          perTryTimeoutRule: [
            required,
            (v) => !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || this.$t('from.integer_rule'),
          ],
          attemptsRule: [required],
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
            if (this.obj.timeout) this.timeout = true;
            if (this.obj.retries) this.retries = true;
          }
        });
      },
      reset() {
        this.$refs.form.resetValidation();
        this.timeout = false;
        this.retries = false;
        this.obj = deepCopy(this.$options.data().obj);
      },
      onTimeoutChange() {
        if (this.timeout) {
          this.obj.timeout = this.timeoutDefault;
        } else {
          this.$delete(this.obj, 'timeout');
        }
      },
      onRetriesChange() {
        if (this.retries) {
          this.obj.retries = this.retriesDefault;
        } else {
          this.$delete(this.obj, 'retries');
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
