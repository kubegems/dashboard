<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-card flat>
    <v-card-text class="pa-5 text-center">
      <Icon class="ml-0 success--text" height="100px" icon="el:ok-sign" width="100px" />
      <h4 class="text-h6 mt-3 mb-8">部署成功</h4>
      <div class="mt-3">
        <v-btn color="primary" small text @click="showDeployStatus"> 查看部署状态 </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'AppStoreComplete',
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus');
      },
    },
  };
</script>
