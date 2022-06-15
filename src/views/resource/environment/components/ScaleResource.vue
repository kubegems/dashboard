<template>
  <BaseDialog v-model="dialog" icon="mdi-scale" title="调整资源限制" :width="1000" @reset="reset">
    <template #content>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-flex :class="expand ? 'kubegems__overlay' : ''" />
        <v-expand-transition>
          <v-card v-show="resourceExpanded" class="my-2 pa-2">
            <BaseSubTitle title="申请资源" />
            <v-card-text class="px-0">
              <component :is="resourceComponent" :data="obj" @addData="addResourceData" @close="closeResourceExpaned" />
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <BaseSubTitle title="租户在集群上已分配资源" />
        <v-card-text>
          <ResourceChart :statistics="obj.statistics" />
        </v-card-text>

        <BaseSubTitle title="资源配额(ResourceQuota)" />
        <v-card-text class="pa-2">
          <ResourceQuota ref="resourceQuota" :data="obj.data" edit :statistics="obj.statistics" />
        </v-card-text>

        <LimitRange ref="limitRange" :data="obj" @addData="addLimitRangeData" @closeOverlay="closeExpand" />

        <BaseSubTitle class="mt-4" title="资源限制(LimitRange)">
          <template #action>
            <v-btn class="float-right mr-2" color="primary" small text @click="openExpaned('limitRange')">
              <v-icon left small> mdi-pencil </v-icon>
              修改限制
            </v-btn>
          </template>
        </BaseSubTitle>
        <v-card-text class="pa-0">
          <LimitRangeCard :obj="obj.data" />
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateEnvironment"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import LimitRange from './base/LimitRange';
  import LimitRangeCard from './base/LimitRangeCard';
  import ResourceApply from './base/ResourceApply';
  import ResourceChart from './base/ResourceChart';
  import ResourceQuota from './base/ResourceQuota';
  import { putUpdateEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ScaleResource',
    components: {
      LimitRange,
      LimitRangeCard,
      ResourceApply,
      ResourceChart,
      ResourceQuota,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      expand: false,
      resourceComponent: '',
      resourceExpanded: false,
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
            text: '请保存数据',
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
      async addResourceData() {
        this.obj.statistics = await this.m_resource_tenantResourceQuota(this.ThisCluster, this.Tenant().TenantName);
        this.closeResourceExpaned();
      },
      async addLimitRangeData(data) {
        this.obj.data.LimitRange = data.LimitRange;
        this.$refs.limitRange.closeCard();
      },
      closeResourceExpaned() {
        this.resourceExpanded = false;
        this.resourceComponent = '';
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
