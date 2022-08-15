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
    <BaseSubTitle :title="$t('tip.cluster_init_config')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col v-if="!control && !edit && obj.extend.existInstaller" cols="12">
          <v-switch v-model="obj.Primary" class="mt-5" :label="$t('tip.control_cluster')" @change="onPrimaryChange" />
        </v-col>
        <v-col v-if="!obj.Primary" cols="6">
          <v-text-field
            v-model="obj.ClusterName"
            :label="$t('form.name')"
            :readonly="edit"
            required
            :rules="objRules.ClusterNameRules"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.ImageRepo"
            color="primary"
            hide-selected
            :items="imageRepoItems"
            :label="$root.$t('resource.image_registry')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.ImageRepoRules"
            :search-input.sync="imageRepoText"
            @keyup.enter="createImageRepo"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.DefaultStorageClass"
            color="primary"
            hide-selected
            :items="storageClassItems"
            :label="$root.$t('resource.storageclass')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.StorageClassesRules"
            :search-input.sync="storageClassText"
            @keyup.enter="createStorageClass"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'InitClusterConfig',
    i18n: {
      messages: messages,
    },
    props: {
      control: {
        type: Boolean,
        default: () => false,
      },
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
      objRules: {
        ClusterNameRules: [required],
        ImageRepoRules: [required],
        StorageClassesRules: [required],
      },
      storageClassText: '',
      imageRepoText: '',
    }),
    computed: {
      storageClassItems() {
        return this.obj.extend.storageClasses.map((sc) => {
          return { value: sc, text: sc };
        });
      },
      imageRepoItems() {
        return this.obj.extend.imageRepos.map((repo) => {
          return { value: repo, text: repo };
        });
      },
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
      getData() {
        return this.obj;
      },
      getExtend() {
        return this.obj.extend;
      },
      async onPrimaryChange() {
        if (this.obj.Primary) {
          this.obj.ClusterName = this.obj.extend.clusterName;
        } else {
          this.obj.ClusterName = '';
        }
      },
      createStorageClass() {
        const index = this.storageClassItems.findIndex((sc) => {
          return sc.value === this.storageClassText.trim();
        });
        if (index === -1) {
          this.obj.extend.storageClasses.push(this.storageClassText.trim());
          this.obj.DefaultStorageClass = this.storageClassText.trim();
          this.storageClassText = '';
        }
      },
      createImageRepo() {
        const index = this.imageRepoItems.findIndex((sc) => {
          return sc.value === this.imageRepoText.trim();
        });
        if (index === -1) {
          this.obj.extend.imageRepos.push(this.imageRepoText.trim());
          this.obj.ImageRepo = this.imageRepoText.trim();
          this.imageRepoText = '';
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
