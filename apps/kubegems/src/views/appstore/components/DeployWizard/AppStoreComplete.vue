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
    <v-card-text class="pa-5 text-center">
      <Icon class="ml-0 success--text" height="100px" icon="mdi:check-circle" width="100px" />
      <h4 class="text-h6 mt-3 mb-8">{{ $t('tip.deploy_success') }}</h4>
      <div class="mt-3">
        <v-btn color="primary" small text @click="showDeployStatus"> {{ $t('tip.view_deploy_status') }} </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'AppStoreComplete',
    i18n: {
      messages: messages,
    },
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus');
      },
    },
  };
</script>
