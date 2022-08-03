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
  <v-form lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="镜像信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-text-field label="镜像地址" />

          <v-text-field label="运行命令" />

          <v-text-field label="环境变量" />

          <v-text-field label="端口号" />

          <v-switch v-model="advanced" label="高级配置" />

          <template v-if="advanced">
            <v-text-field v-model="obj.modelPath" label="模型挂载路径" />

            <v-text-field v-model="obj.host" label="访问域名" />
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  export default {
    name: 'ImageDeploy',
    props: {
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
      // spec: {
      //   type: Object,
      //   default: () => null,
      // },
    },
    data() {
      return {
        advanced: false,
        obj: {
          host: '',
          model: {
            framework: '',
            image: '',
            name: '',
            url: '',
            version: '',
          },
          modelPath: '',
          resources: {},
          replicas: 1,
        },
      };
    },
  };
</script>
