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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="$t('tip.test_cluster')" />
    <v-card-text v-if="Circular" class="py-6 px-2 mt-2" :style="{ width: `500px`, margin: `auto` }">
      <v-progress-linear buffer-value="0" color="green" height="10" indeterminate rounded stream />
    </v-card-text>
    <v-card-text>
      <v-flex class="text-subtitle-1 text-center">
        <template v-if="obj.extend.validate === 'success'">
          <v-icon color="success" left small> mdi-check-circle </v-icon>
          {{ $t('tip.connect_success') }}
        </template>
        <template v-else-if="obj.extend.validate === 'error'">
          <v-icon color="error" left small> mdi-close-circle </v-icon>
          {{ $t('tip.connect_failed') }}
        </template>
        <template v-if="obj.extend.validate === 'progressing'">
          <v-icon color="warning" left small> mdi-checkbox-blank-circle </v-icon>
          {{ $t('tip.connecting') }}......
        </template>
      </v-flex>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { postValidateClusterKubeConfig } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'TestKubeConfig',
    i18n: {
      messages: messages,
    },
    data: () => ({
      valid: false,
      obj: {
        ClusterID: 0,
        ClusterName: '',
        KubeConfig: '',
        Primary: false,
        Vendor: 'selfhosted',
        ImageRepo: 'registry.cn-beijing.aliyuncs.com/kubegems',
        DefaultStorageClass: 'local-path',
        extend: {
          storageClasses: [],
          imageRepos: ['registry.cn-beijing.aliyuncs.com/kubegems', 'docker.io/kubegems'],
          validate: 'progressing',
          clusterName: '',
          existInstaller: false,
        },
      },
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
          this.validateKubeConfig();
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      getData() {
        return this.obj;
      },
      getExtend() {
        return this.obj.extend;
      },
      async validateKubeConfig() {
        const data = await postValidateClusterKubeConfig({
          kubeconfig: JSON.stringify(this.$yamlload(this.obj.KubeConfig)),
        });
        this.obj.extend.storageClasses = data.storageClasses || [];
        this.obj.extend.validate = data.connectable ? 'success' : 'error';
        this.obj.extend.clusterName = data.clusterName;
        this.obj.extend.existInstaller = data.existInstaller;
        this.$emit('refresh', this.obj);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
