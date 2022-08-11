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
    <BaseSubTitle
      :title="
        cluster
          ? `${$root.$t('resource.cluster')} ${cluster}`
          : $root.$t('form.definition', [$root.$t('resource.cluster')])
      "
    />
    <v-card-text class="pa-2">
      <v-row v-if="!edit">
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.ClusterID"
            class="my-0"
            color="primary"
            hide-selected
            :items="m_select_clusterItems"
            :label="$root.$t('resource.cluster')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.clusterIDRules"
            @change="onClusterChange"
            @focus="onClusterSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <ResourceChart :nvidia="nvidia" :quota="quota" :tke="tke" />

      <BaseSubTitle :title="$t('resource.tip.resource_limit')" />
      <v-card-text class="px-0 pb-2">
        <v-row class="mx-0">
          <v-col class="px-0 py-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ $t('resource.form.apply', [$root.$t('resource.cpu')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }} core
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.cpu']"
                class="my-0"
                :label="
                  edit
                    ? `${$t('resource.tip.scale_limit', [$root.$t('resource.cpu')])}`
                    : `${$t('resource.tip.limit', [$root.$t('resource.cpu')])}`
                "
                required
                :rules="objRules.cpuRules"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> core </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
          <v-col class="pa-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ $t('resource.form.apply', [$root.$t('resource.memory')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }} Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.memory']"
                class="my-0"
                :label="
                  edit
                    ? `${$t('resource.tip.scale_limit', [$root.$t('resource.memory')])}`
                    : `${$t('resource.tip.limit', [$root.$t('resource.memory')])}`
                "
                required
                :rules="objRules.memoryRules"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> Gi </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
          <v-col class="px-0 py-0" cols="4">
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                {{ $t('resource.form.apply', [$root.$t('resource.storage')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }}
                  Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content[`requests.storage`]"
                class="my-0"
                :label="
                  edit
                    ? `${$t('resource.tip.scale_limit', [$root.$t('resource.storage')])}`
                    : `${$t('resource.tip.limit', [$root.$t('resource.storage')])}`
                "
                required
                :rules="objRules.storageRules"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text"> Gi </span>
                </template>
              </v-text-field>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="nvidia || tke">
        <BaseSubTitle :title="$t('resource.tip.gpu_resource_limit')" />
        <v-card-text class="px-0 pb-2">
          <v-row class="mx-0">
            <v-col v-if="nvidia" class="px-0 py-0" cols="4">
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  nvidia {{ $t('resource.form.apply', [$root.$t('resource.gpu')]) }}
                  <span class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedNvidiaGpu.toFixed(1) : 0 }} Gpu
                  </span>
                </v-flex>
                <v-text-field
                  v-model="obj.Content['limits.nvidia.com/gpu']"
                  class="my-0"
                  :label="
                    edit
                      ? `nvidia ${$t('resource.tip.scale_limit', [$root.$t('resource.gpu')])}`
                      : `nvidia ${$t('resource.tip.limit', [$root.$t('resource.gpu')])}`
                  "
                  required
                  :rules="objRules.nvidiaRules"
                  type="number"
                >
                  <template #append>
                    <span class="text-body-2 kubegems__text"> Gpu </span>
                  </template>
                </v-text-field>
              </v-sheet>
            </v-col>
            <template v-if="tke">
              <v-col class="pa-0" cols="4">
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    tke {{ $t('resource.form.apply', [$root.$t('resource.gpu')]) }}
                    <span class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeGpu.toFixed(1) : 0 }} {{ $t('resource.form.unit') }} (1{{
                        $t('resource.form.unit')
                      }}=0.01 Gpu)
                    </span>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content['tencent.com/vcuda-core']"
                    class="my-0"
                    :label="
                      edit
                        ? `tke ${$t('resource.tip.scale_limit', [$root.$t('resource.gpu')])}`
                        : `tke ${$t('resource.tip.limit', [$root.$t('resource.gpu')])}`
                    "
                    required
                    :rules="objRules.tkeVcudaRules"
                    type="number"
                  >
                    <template #append>
                      <span class="text-body-2 kubegems__text">
                        {{ parseInt(obj.Content['tencent.com/vcuda-core'] || 0) / 100 }} Gpu
                      </span>
                    </template>
                  </v-text-field>
                </v-sheet>
              </v-col>
              <v-col class="px-0 py-0" cols="4">
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    tke {{ $t('resource.form.apply', [$root.$t('resource.video_memory')]) }}
                    <span class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeMemory.toFixed(1) : 0 }} {{ $t('resource.form.unit') }} (1{{
                        $t('resource.form.unit')
                      }}=256Mi)
                    </span>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content[`tencent.com/vcuda-memory`]"
                    class="my-0"
                    :label="
                      edit
                        ? `tke ${$t('resource.tip.scale_limit', [$root.$t('resource.video_memory')])}`
                        : `tke ${$t('resource.tip.limit', [$root.$t('resource.video_memory')])}`
                    "
                    required
                    :rules="objRules.tkeVcudaMemoryRules"
                    type="number"
                  >
                    <template #append>
                      <span class="text-body-2 kubegems__text">
                        {{ (parseInt(obj.Content['tencent.com/vcuda-memory'] || 0) * 256) / 1024 }}Gi
                      </span>
                    </template>
                  </v-text-field>
                </v-sheet>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
      </template>
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../../i18n';
  import ResourceChart from './ResourceChart';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { integer, required } from '@/utils/rules';

  export default {
    name: 'ResourceBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceChart,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      cluster: {
        type: String,
        default: () => '',
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      quota: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          ClusterID: null,
          TenantID: null,
          Content: {
            'limits.cpu': '',
            'limits.memory': '',
            'requests.storage': '',
          },
        },
      };
    },
    computed: {
      nvidia() {
        if (this.quota) {
          return Object.prototype.hasOwnProperty.call(this.quota, 'NvidiaGpu');
        }
        return false;
      },
      tke() {
        if (this.quota) {
          return (
            Object.prototype.hasOwnProperty.call(this.quota, 'TkeGpu') ||
            Object.prototype.hasOwnProperty.call(this.quota, 'TkeMemory')
          );
        }
        return false;
      },
      objRules() {
        return {
          clusterIDRules: [required],
          cpuRules: [
            required,
            integer,
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedCpu : 0) || this.$t('resource.form.limit_rule'),
          ],
          memoryRules: [
            required,
            integer,
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedMemory : 0) || this.$t('resource.form.limit_rule'),
          ],
          storageRules: [
            required,
            integer,
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedStorage : 0) || this.$t('resource.form.limit_rule'),
          ],
          nvidiaRules: [
            required,
            integer,
            (v) =>
              parseInt(v) <= (this.quota ? this.quota.AllocatedNvidiaGpu : 0) || this.$t('resource.form.limit_rule'),
          ],
          tkeVcudaRules: [
            required,
            integer,
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedTkeGpu : 0) || this.$t('resource.form.limit_rule'),
          ],
          tkeVcudaMemoryRules: [
            required,
            integer,
            (v) =>
              parseInt(v) <= (this.quota ? this.quota.AllocatedTkeMemory : 0) || this.$t('resource.form.limit_rule'),
          ],
        };
      },
    },
    watch: {
      nvidia: {
        handler(newValue) {
          if (newValue && !this.edit) {
            this.obj.Content['limits.nvidia.com/gpu'] = '';
          }
        },
        deep: true,
      },
      tke: {
        handler(newValue) {
          if (newValue && !this.edit) {
            this.obj.Content['tencent.com/vcuda-core'] = '';
            this.obj.Content['tencent.com/vcuda-memory'] = '';
          }
        },
        deep: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      setContent(data) {
        this.obj.Content = deepCopy(data);
      },
      reset() {
        this.$refs.form.reset();
      },
      onClusterSelectFocus() {
        this.m_select_clusterSelectData(null, false);
      },
      onClusterChange() {
        this.$emit('clusterChange', this.obj.ClusterID);
      },
    },
  };
</script>
