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
  <div>
    <BaseSubTitle :title="$t('tip.config', ['kafka'])" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.kafka.brokers"
            class="my-0"
            label="brokers"
            required
            :rules="objRules.brokersRules"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="obj.spec.kafka.default_topic" class="my-0" label="default_topic" required />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import messages from '../../../../i18n';
  import { required } from '@/utils/rules';

  export default {
    name: 'Kafka',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          spec: {
            kafka: {
              brokers: '',
              default_topic: '',
            },
          },
        },
        objRules: {
          brokersRules: [required],
        },
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
        if (this.item?.spec?.kafka) {
          this.obj = this.$_.merge(this.item, this.obj);
        }
      });
    },
    methods: {
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
