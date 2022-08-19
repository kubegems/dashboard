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
    <BaseSubTitle :title="$t('tip.config', ['loki'])" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-text-field v-model="obj.spec.loki.url" class="my-0" label="url" required :rules="objRules.urlRules" />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import messages from '../../../../i18n';
  import { required } from '@/utils/rules';

  export default {
    name: 'Loki',
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
      this.obj = {
        spec: {
          loki: {
            url: '',
            labels: {
              container: '$.kubernetes.container_name',
              image: '$.kubernetes.container_image',
              namespace: '$.kubernetes.namespace_name',
              node: '$.kubernetes.host',
              pod: '$.kubernetes.pod_name',
              stream: '$.stream',
            },
            extra_labels: {
              cluster: this.$route?.query.cluster,
            },
            extract_kubernetes_labels: true,
            remove_keys: ['logtag', 'kubernetes', 'docker', 'time', 'throttle_group_key'],
            drop_single_key: true,
            configure_kubernetes_labels: false,
            buffer: {
              tags: 'time',
              total_limit_size: '10G',
              flush_mode: 'interval',
              flush_interval: '1s',
              flush_thread_count: 4,
              timekey: '1m',
              timekey_wait: '5s',
            },
          },
        },
      };

      return {
        valid: false,
        objRules: {
          urlRules: [required],
        },
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
        if (this.item?.spec?.loki) {
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
