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
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeName"
          class="my-0"
          color="primary"
          hide-selected
          :items="items"
          :label="$root.$t('resource.secret')"
          :no-data-text="$root.$t('data.no_data')"
          :readonly="edit"
          :rules="volumeRules.SecretRule"
          @change="onVolumeChange"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet
      v-for="(item, index) in volumeCopy && volumeCopy.secret.items ? volumeCopy.secret.items : []"
      :key="index"
      class="px-2"
    >
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeCopy.secret.items[index].key"
          class="my-0"
          color="primary"
          hide-selected
          :items="secrets"
          :label="$root.$t('resource.secret_key')"
          :no-data-text="$root.$t('data.no_data')"
          :rules="volumeRules[index].KeyRule"
          @focus="onSecretKeySelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="volumeCopy.secret.items[index].path"
          class="my-0"
          :label="$t('tip.path')"
          required
          :rules="volumeRules[index].PathRule"
        />
      </v-flex>
      <v-btn class="mt-4" color="error" dark fab right text x-small @click="removeKV(index)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount ref="volumeMount" :containers="containers" :volume="volume" :volume-mount-name="volumeMountName" />
    <VolumeMountForInitContainer
      v-if="initContainers && initContainers.length > 0"
      ref="volumeMountForInitContainer"
      :init-containers="initContainers"
      :volume="volume"
      :volume-mount-name="volumeMountName"
    />
  </v-form>
</template>

<script>
  import messages from '../../../../i18n';
  import VolumeMount from './VolumeMount';
  import VolumeMountForInitContainer from './VolumeMountForInitContainer';
  import { getAppResourceFileMetas, getSecretDetail, getSecretList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'SecretMount',
    i18n: {
      messages: messages,
    },
    components: {
      VolumeMount,
      VolumeMountForInitContainer,
    },
    mixins: [BaseResource],
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      initContainers: {
        type: Array,
        default: () => [],
      },
      namespace: {
        type: String,
        default: () => '',
      },
      manifest: {
        type: Boolean,
        default: () => false,
      },
      volume: {
        type: Object,
        default: () => null,
      },
      volumeMountName: {
        type: String,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        items: [],
        secrets: [],
        volumeName: null,
        volumeCopy: {
          secret: {
            items: [],
          },
        },
      };
    },
    computed: {
      volumeObj() {
        const index = this.items.findIndex((v) => {
          return v.value === this.volumeName;
        });
        if (index > -1) return this.items[index];
        return null;
      },
      volumeRules() {
        const rule = { SecretRule: [required] };
        if (this.volumeCopy && this.volumeCopy.secret.items) {
          this.volumeCopy.secret.items.forEach((i, index) => {
            rule[index] = {};
            rule[index].KeyRule = [required];
            rule[index].PathRule = [required];
          });
        }
        return rule;
      },
    },
    watch: {
      volume: {
        handler: function () {
          this.loadData();
        },
        deep: true,
      },
    },
    async mounted() {
      await this.secretList();
      this.loadData();
    },
    methods: {
      loadData() {
        if (this.volume) {
          this.volumeName = this.volume.secret.secretName.replaceAll('.', '-');
          this.volumeCopy = deepCopy(this.volume);
          if (this.namespace.length > 0) {
            this.secretDetail();
          }
        }
      },
      async secretList() {
        let data = {};
        if (this.manifest) {
          data = await getAppResourceFileMetas(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            this.ThisAppEnvironmentID,
            this.$route.params.name,
            {
              kind: 'Secret',
            },
          );
          this.items = data;
        } else {
          data = await getSecretList(this.ThisCluster, this.namespace || this.$route.query.namespace, {
            size: 1000,
          });
          this.items = data.List;
        }
        this.items.forEach((v) => {
          v.text = v.secret ? v.secret.metadata.name : v.metadata.name;
          v.value = v.secret ? v.secret.metadata.name.replaceAll('.', '-') : v.metadata.name.replaceAll('.', '-');
        });
      },
      async secretDetail() {
        const data = await getSecretDetail(
          this.ThisCluster,
          this.namespace || this.$route.query.namespace,
          this.volume?.secret?.secretName || this.volumeName,
        );
        if (data.data) {
          for (const item in data.data) {
            this.secrets.push({
              text: item,
              value: item,
            });
          }
        }
      },
      onVolumeChange() {
        this.$refs.volumeMount.initVolumeMount(this.volumeName);
        if (this.$refs.volumeMountForInitContainer) {
          this.$refs.volumeMountForInitContainer.initVolumeMount(this.volumeName);
        }
      },
      generateData() {
        if (this.$refs.form.validate(true)) {
          const data = this.$refs.volumeMount.generateData();
          if (data) {
            return {
              volumeMount: data,
              volume: {
                name: this.volume ? this.volume.name : this.volumeName,
                secret: {
                  secretName: this.volumeObj.text,
                  items: this.volumeCopy.secret.items ? this.volumeCopy.secret.items : [],
                },
              },
            };
          }
          return null;
        }
        return null;
      },
      generateInitData() {
        if (this.$refs.form.validate(true)) {
          const data = this.$refs.volumeMountForInitContainer.generateData();
          if (data) {
            return {
              init: data,
            };
          }
          return null;
        }
        return null;
      },
      removeKV(index) {
        this.$delete(this.volumeCopy.secret.items, index);
      },
      addItem() {
        if (!this.volumeCopy.secret.items) this.volumeCopy.secret.items = [];
        this.volumeCopy.secret.items.push({ key: '', path: '' });
      },
      onSecretKeySelectFocus() {
        this.secretDetail();
      },
    },
  };
</script>
