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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-row class="mx-0">
      <v-col class="px-2 py-0" cols="4">
        <v-sheet class="pa-2">
          <v-flex class="text-subtitle-1 mb-2">
            可用CPU
            <span class="text-subtitle-2 primary--text">
              {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }}
              core
            </span>
            当前
            <span class="text-subtitle-2 primary--text"> {{ statistics ? statistics.Cpu : 0 }} core </span>
          </v-flex>
          <v-text-field
            v-model="obj.Content['limits.cpu']"
            class="my-0"
            label="CPU扩容后限制值"
            required
            :rules="objRules.cpuRules"
            suffix="core"
          />
        </v-sheet>
      </v-col>
      <v-col class="px-2 py-0" cols="4">
        <v-sheet class="pa-2">
          <v-flex class="text-subtitle-1 mb-2">
            可用内存
            <span class="text-subtitle-2 primary--text">
              {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }}
              Gi
            </span>
            当前
            <span class="text-subtitle-2 primary--text"> {{ statistics ? statistics.Memory : 0 }} Gi </span>
          </v-flex>
          <v-text-field
            v-model="obj.Content['limits.memory']"
            class="my-0"
            label="内存扩容后限制值"
            required
            :rules="objRules.memoryRules"
            suffix="Gi"
          />
        </v-sheet>
      </v-col>
      <v-col class="px-2 py-0" cols="4">
        <v-sheet class="pa-2">
          <v-flex class="text-subtitle-1 mb-2">
            可用存储
            <span class="text-subtitle-2 primary--text"> {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }} Gi </span>
            当前
            <span class="text-subtitle-2 primary--text"> {{ statistics ? statistics.Storage : 0 }} Gi </span>
          </v-flex>
          <v-text-field
            v-model="obj.Content[`requests.storage`]"
            class="my-0"
            label="存储扩容后限制值"
            required
            :rules="objRules.storageRules"
            suffix="Gi"
          />
        </v-sheet>
      </v-col>
    </v-row>
    <v-btn absolute bottom color="error" dark fab right :style="{ right: `60px` }" x-small @click="close">
      <v-icon>mdi-close-box</v-icon>
    </v-btn>
    <v-btn absolute bottom color="primary" dark fab right x-small @click="addData">
      <v-icon>mdi-checkbox-marked</v-icon>
    </v-btn>
  </v-form>
</template>

<script>
  import { mapGetters } from 'vuex';

  import { putUpdateTenantResourceQuota } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ResourceApply',
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      quota: null,
      statistics: null,
      obj: {
        ClusterID: null,
        TenantID: null,
        Content: {
          'limits.cpu': '',
          'limits.memory': '',
          'requests.storage': '',
        },
      },
    }),
    computed: {
      ...mapGetters(['Tenant']),
      objRules() {
        return {
          cpuRules: [
            required,
            (v) => !!new RegExp('^([0-9][0-9]*)+(.[0-9]{1,2})?$').test(v) || '格式错误(示例:整数)',
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedCpu : 0) || '超出最大值限制',
          ],
          memoryRules: [
            required,
            (v) => !!new RegExp('^([0-9][0-9]*)+(.[0-9]{1,2})?$').test(v) || '格式错误(示例:整数)',
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedMemory : 0) || '超出最大值限制',
          ],
          storageRules: [
            required,
            (v) => !!new RegExp('^([0-9][0-9]*)+(.[0-9]{1,2})?$').test(v) || '格式错误(示例:整数)',
            (v) => parseInt(v) <= (this.quota ? this.quota.AllocatedStorage : 0) || '超出最大值限制',
          ],
        };
      },
    },
    watch: {
      data() {
        const d = deepCopy(this.data);
        this.quota = d.quota;
        this.statistics = d.statistics;
      },
    },
    mounted() {
      if (this.data) {
        const d = deepCopy(this.data);
        this.quota = d.quota;
        this.statistics = d.statistics;
      }
    },
    methods: {
      async addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.obj);
          data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`;
          data.Content[`requests.storage`] = `${data.Content[`requests.storage`]}Gi`;
          data.ClusterID = this.data.data.ClusterID;
          data.TenantID = this.Tenant().ID;
          await putUpdateTenantResourceQuota(this.Tenant().ID, this.data.data.ClusterID, data);
          this.$emit('addData', data);
        }
      },
      close() {
        this.$refs.form.reset();
        this.$emit('close');
      },
    },
  };
</script>
