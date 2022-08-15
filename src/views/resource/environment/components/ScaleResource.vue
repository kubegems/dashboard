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
  <BaseDialog v-model="dialog" icon="mdi-scale" :title="$t('operate.scale_resource')" :width="1000" @reset="reset">
    <template #content>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-flex :class="expand ? 'kubegems__overlay' : ''" />

        <BaseSubTitle :title="$t('tip.tenant_resource_allocated')" />
        <v-card-text>
          <ResourceChart :statistics="obj.statistics" />
        </v-card-text>

        <BaseSubTitle :title="$t('tip.resource_quota')" />
        <v-card-text class="pa-2">
          <ResourceQuota ref="resourceQuota" :data="obj.data" edit :statistics="obj.statistics" />
        </v-card-text>

        <LimitRange ref="limitRange" :data="obj" @addData="addLimitRangeData" @closeOverlay="closeExpand" />

        <BaseSubTitle class="mt-4" :title="$t('tip.limit_range')">
          <template #action>
            <v-btn class="float-right mr-2" color="primary" small text @click="openExpaned('limitRange')">
              <v-icon left small> mdi-pencil </v-icon>
              {{ $t('operate.edit_limit') }}
            </v-btn>
          </template>
        </BaseSubTitle>
        <v-card-text class="pa-0">
          <LimitRangeCard :obj="obj.data" />
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateEnvironment">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import LimitRange from './base/LimitRange';
  import LimitRangeCard from './base/LimitRangeCard';
  import ResourceChart from './base/ResourceChart';
  import ResourceQuota from './base/ResourceQuota';
  import { putUpdateEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ScaleResource',
    i18n: {
      messages: messages,
    },
    components: {
      LimitRange,
      LimitRangeCard,
      ResourceChart,
      ResourceQuota,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      expand: false,
      obj: {
        data: null,
        statistics: null,
        quota: null,
      },
    }),
    computed: {
      ...mapState(['Circular', 'User']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateEnvironment() {
        if (!this.checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.save_data'),
            color: 'warning',
          });
          return;
        }
        if (this.$refs.form.validate(true)) {
          const data = this.obj.data;
          await putUpdateEnvironment(data.ID, {
            EnvironmentID: data.ID,
            EnvironmentName: data.EnvironmentName,
            ClusterID: data.ClusterID,
            MetaType: data.MetaType,
            Namespace: data.Namespace,
            ProjectID: data.ProjectID,
            Remark: data.Remark,
            CreatorID: this.User.ID,
            ResourceQuota: this.$refs.resourceQuota.generateUnit(),
            LimitRange: data.LimitRange,
          });
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        this.obj.data = deepCopy(item);
        this.obj.statistics = await this.m_resource_tenantResourceQuota(this.ThisCluster, this.Tenant().TenantName);
        this.obj.statistics.AllocatedPod = this.obj.data.ResourceQuota['count/pods']
          ? this.obj.data.ResourceQuota['count/pods']
          : 5120;
        this.obj.statistics.ApplyPod = this.obj.statistics.Pod - this.obj.statistics.AllocatedPod;
        this.obj.quota = await this.m_resource_clusterQuota(this.obj.data.ClusterID, {
          NowCpu: this.obj.statistics.Cpu,
          NowMemory: this.obj.statistics.Memory,
          NowStorage: this.obj.statistics.Storage,
          NowNvidiaGpu: this.obj.statistics.NvidiaGpu,
          NowTkeGpu: this.obj.statistics.TkeGpu,
          NowTkeMemory: this.obj.statistics.TkeMemory,
        });
        this.$refs.form.validate(true);
      },
      openExpaned(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      async addLimitRangeData(data) {
        this.obj.data.LimitRange = data.LimitRange;
        this.$refs.limitRange.closeCard();
      },
      checkSaved() {
        if (this.$refs.limitRange.expand) {
          return !this.$refs.limitRange.expand;
        }
        return true;
      },
      reset() {
        this.dialog = false;
        this.$refs.limitRange.closeCard();
        this.$refs.form.reset();
      },
    },
  };
</script>
