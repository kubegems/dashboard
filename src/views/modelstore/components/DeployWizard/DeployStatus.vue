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
  <v-card flat>
    <v-dialog v-if="deploying" hide-overlay light persistent :value="processing" width="300">
      <v-card class="pa-1" color="primary" flat>
        <v-card-text class="text-center white--text">
          {{ $t('status.deploying') }}
          <v-progress-linear class="mb-0 mt-2" color="white" indeterminate />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card-text v-else class="pa-5 text-center">
      <Icon class="ml-0 success--text" height="100px" icon="mdi:check-circle" width="100px" />
      <h4 class="text-h6 mt-3 mb-8">{{ $t('status.deploy_success') }}</h4>
      <div class="mt-3">
        <v-btn color="primary" small text @click="showDeployStatus"> {{ $t('operate.view_deploy_status') }} </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'DeployStatus',
    i18n: {
      messages: messages,
    },
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      processing: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        deploying: true,
      };
    },
    watch: {
      processing: {
        handler(newValue) {
          if (newValue) {
            const _v = this;
            setTimeout(() => {
              _v.deploying = false;
            }, 3000);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus', this.base);
      },
    },
  };
</script>
