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
      <BaseSubTitle :title="$t('tip.cluster_vendor')" />
      <v-card-text class="pa-2">
        <v-row class="mt-0">
          <v-col v-for="(item, index) in vendorItems" :key="index" cols="4">
            <v-hover #default="{ hover }">
              <v-card class="kubegems__pointer vendor__pos" :elevation="hover ? 5 : 1" flat @click="selectVendor(item)">
                <v-list-item three-line>
                  <v-list-item-avatar class="primary--text" size="50" tile>
                    <BaseLogo :icon-name="item.value" :width="40" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 kubegems__pointer">
                      {{ item.vendor }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-body-2"> {{ $t('tip.support_version') }} : </span>
                      v1.20+
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="obj.Vendor === item.value">
                  <v-flex class="vendor__watermark-bg" />
                  <v-flex class="vendor__watermark font-weight-medium"> {{ $t('tip.now_select') }} </v-flex>
                </template>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>

    <BaseSubTitle title="Kubeconfig" />
    <v-card-text class="pa-2">
      <ACEEditor
        v-model="obj.KubeConfig"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
        height="500"
        lang="yaml"
        :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
        theme="chrome"
        @init="$aceinit"
        @keydown.stop
      />
    </v-card-text>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ValidateKubeConfig',
    i18n: {
      messages: messages,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
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
      vendorItems: [
        { vendor: 'Kubernetes Self-host', value: 'selfhosted' },
        { vendor: 'Aliyun ACK', value: 'ack' },
        { vendor: 'GoogleCloud GKE', value: 'gke' },
      ],
    }),
    computed: {
      ...mapState(['Scale']),
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
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
      selectVendor(item) {
        if (this.edit) return;
        this.obj.Vendor = item.value;
      },
      getData() {
        return this.obj;
      },
      getExtend() {
        return this.obj.extend;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .vendor {
    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 10px;
      right: -4px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
