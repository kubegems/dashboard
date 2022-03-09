<template>
  <v-flex>
    <v-card
      v-for="(cluster, index) in clusters"
      :key="index"
      :class="`${index > 0 ? 'mt-3' : 'mt-6'}`"
    >
      <BaseSubTitle
        :title="`集群 ${cluster.ClusterName}`"
        :divider="false"
      >
        <template #action>
          <v-switch
            v-if="m_permisson_resourceAllow"
            v-model="cluster.Isolation"
            class="float-right mt-2 mr-4"
            color="primary"
            hide-details
            @change="onNetworkPolicyChange(cluster, 'project')"
            @click.stop
          >
            <template #label>
              <span class="text-subtitle-2"> 开启项目网络隔离 </span>
            </template>
          </v-switch>
        </template>
      </BaseSubTitle>

      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="items[cluster.ClusterName]"
          :items-per-page="100"
          no-data-text="暂无数据"
          hide-default-footer
        >
          <template #[`item.environmentName`]="{ item }">
            <a
              class="text-subtitle-2"
              @click="environmentDetail(item)"
            >
              {{ item.EnvironmentName }}
            </a>
          </template>
          <template #[`item.metaType`]="{ item }">
            <v-chip
              small
              label
              :color="
                $METATYPE_CN[item.MetaType] && $METATYPE_CN[item.MetaType].color
                  ? $METATYPE_CN[item.MetaType].color
                  : 'grey'
              "
            >
              {{ $METATYPE_CN[item.MetaType].cn }}
            </v-chip>
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.Creator.Username }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.Namespace }}
          </template>
          <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
          <template #[`item.memory`]="{ item }"> {{ item.Memory }} Gi </template>
          <template #[`item.storage`]="{ item }"> {{ item.Storage }} Gi </template>
          <template #[`item.usedCpu`]="{ item }">
            {{ item.UsedCpu.toFixed(1) }} core
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.CpuPercentage"
              height="15"
              :color="
                item.CpuPercentage
                  ? item.CpuPercentage < 60
                    ? 'primary'
                    : item.CpuPercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text"> {{ item.CpuPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedMemory`]="{ item }">
            {{ item.UsedMemory.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.MemoryPercentage"
              height="15"
              :color="
                item.MemoryPercentage
                  ? item.MemoryPercentage < 60
                    ? 'primary'
                    : item.MemoryPercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text"> {{ item.MemoryPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedStorage`]="{ item }">
            {{ item.UsedStorage.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.StoragePercentage"
              height="15"
              :color="
                item.StoragePercentage
                  ? item.StoragePercentage < 60
                    ? 'primary'
                    : item.StoragePercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text"> {{ item.StoragePercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.isolation`]="{ item }">
            <v-switch
              v-model="item.Isolation"
              class="float-right mt-0 mr-2"
              color="primary"
              hide-details
              dense
              @change="onNetworkPolicyChange(item, 'environment')"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getNetworkPolicyDetail,
  postUpdateEnvironmentNetworkPolicy,
  postUpdateProjectNetworkPolicy,
  getProjectEnvironmentAggregation,
} from '@/api'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import { sizeOfStorage, sizeOfCpu } from '@/utils/helpers'

export default {
  name: 'EnvironmentList',
  mixins: [BaseSelect, BaseResource, BasePermission, BaseFilter],
  inject: ['reload'],
  props: {
    ready: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    items: {},
    clusters: [],
    params: {
      page: 1,
      size: 1000,
    },
  }),
  computed: {
    ...mapState(['JWT', 'Admin', 'AdminViewport']),
    ...mapGetters(['Project', 'Tenant', 'Cluster']),
    headers() {
      const items = [
        {
          text: '环境空间',
          value: 'environmentName',
          align: 'start',
          width: 180,
        },
        { text: '环境类型', value: 'metaType', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '创建人', value: 'creator', align: 'start' },
        { text: 'CPU', value: 'cpu', align: 'start' },
        { text: '内存', value: 'memory', align: 'start' },
        { text: '存储', value: 'storage', align: 'start' },
        { text: '已使用CPU', value: 'usedCpu', align: 'start', width: 150 },
        { text: '已使用内存', value: 'usedMemory', align: 'start', width: 150 },
        {
          text: '已使用存储',
          value: 'usedStorage',
          align: 'start',
          width: 150,
        },
      ]
      if (this.m_permisson_resourceAllow) {
        items.push({
          text: '网络隔离',
          value: 'isolation',
          align: 'center',
          width: 100,
        })
      }
      return items
    },
  },
  watch: {
    ready() {
      if (this.ready) {
        if (this.Tenant().ID > 0) {
          Object.assign(this.params, this.$route.query)
          this.environmentList()
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或加入租户`,
            color: 'warning',
          })
        }
      }
    },
  },
  methods: {
    async projectEnvironmentAggregation() {
      const data = await getProjectEnvironmentAggregation(this.Project().ID, {
        noprocessing: true,
      })
      if (data) {
        for (const key in data) {
          this.clusters.push({
            ClusterName: key,
            ClusterID: data[key].ClusterID,
          })
          const envs = []
          data[key].Environments.forEach((e) => {
            e.EnvironmentName = e.Env.EnvironmentName
            e.MetaType = e.Env.MetaType
            e.Namespace = e.Env.Namespace
            e.Creator = e.Env.Creator
            if (e.ResourceQuota && e.ResourceQuota.status.hard) {
              e.Cpu = e.ResourceQuota.status.hard['limits.cpu']
                ? parseFloat(
                    sizeOfCpu(e.ResourceQuota.status.hard['limits.cpu']),
                  )
                : 0
              e.Memory = e.ResourceQuota.status.hard['limits.memory']
                ? parseFloat(
                    sizeOfStorage(e.ResourceQuota.status.hard['limits.memory']),
                  )
                : 0
              e.Storage = e.ResourceQuota.status.hard['requests.storage']
                ? parseFloat(
                    sizeOfStorage(
                      e.ResourceQuota.status.hard['requests.storage'],
                    ),
                  )
                : 0
            } else {
              e.Cpu = 0
              e.Memory = 0
              e.Storage = 0
            }
            if (e.ResourceQuota && e.ResourceQuota.status.used) {
              e.UsedCpu = e.ResourceQuota.status.used['limits.cpu']
                ? parseFloat(
                    sizeOfCpu(e.ResourceQuota.status.used['limits.cpu']),
                  )
                : 0
              e.UsedMemory = e.ResourceQuota.status.used['limits.memory']
                ? parseFloat(
                    sizeOfStorage(e.ResourceQuota.status.used['limits.memory']),
                  )
                : 0
              e.UsedStorage = e.ResourceQuota.status.used['requests.storage']
                ? parseFloat(
                    sizeOfStorage(
                      e.ResourceQuota.status.used['requests.storage'],
                    ),
                  )
                : 0
            } else {
              e.UsedCpu = 0
              e.UsedMemory = 0
              e.UsedStorage = 0
            }
            e.CpuPercentage =
              e.Cpu > 0 ? ((e.UsedCpu / e.Cpu) * 100).toFixed(1) : 0
            e.MemoryPercentage =
              e.Memory > 0 ? ((e.UsedMemory / e.Memory) * 100).toFixed(1) : 0
            e.StoragePercentage =
              e.Storage > 0 ? ((e.UsedStorage / e.Storage) * 100).toFixed(1) : 0
            envs.push(e)
            this.items[key] = envs
          })
        }
      }
    },
    async environmentList() {
      await this.projectEnvironmentAggregation()
      await this.networkPolicyDetail()
    },
    async networkPolicyDetail() {
      for (const clusterName in this.items) {
        const data = await getNetworkPolicyDetail(
          clusterName,
          this.Tenant().TenantName,
          {
            noprocessing: true,
          },
        )
        const index = this.clusters.findIndex((c) => {
          return c.ClusterName === clusterName
        })
        if (index > -1) {
          const item = this.clusters[index]
          item.Metadata = data.metadata
          if (data.spec.projectNetworkPolicies) {
            const policy = data.spec.projectNetworkPolicies.find((n) => {
              return n.name === this.Project().ProjectName
            })
            if (policy) {
              item.Isolation = true
            } else {
              item.Isolation = false
            }
          }
          this.$set(this.clusters, index, item)
        }
        if (data.spec.environmentNetworkPolicies) {
          this.items[clusterName].forEach((i, index) => {
            const policy = data.spec.environmentNetworkPolicies.find((n) => {
              return n.name === i.EnvironmentName
            })
            const item = this.items[clusterName][index]
            if (policy) {
              item.Isolation = true
            } else {
              item.Isolation = false
            }
            this.$set(this.items[clusterName], index, item)
          })
        }
      }
    },
    async onNetworkPolicyChange(item, type) {
      this.$store.commit('SET_CONFIRM', {
        title: '更新网络隔离策略',
        content: {
          text: `更新 ${
            type === 'project'
              ? this.Project().ProjectName
              : item.Env.EnvironmentName
          } 网络隔离策略`,
          type: 'confirm',
        },
        param: { item, type },
        doFunc: async (param) => {
          if (param.type === 'project') {
            await postUpdateProjectNetworkPolicy(this.Project().ID, {
              cluster_id: param.item.ClusterID,
              isolate: param.item.Isolation,
            })
          } else if (param.type === 'environment') {
            await postUpdateEnvironmentNetworkPolicy(param.item.Env.ID, {
              isolate: param.item.Isolation,
            })
          }
        },
        doClose: (param) => {
          if (param.type === 'project') {
            const index = this.clusters.findIndex((t) => {
              return t.ClusterName === param.item.ClusterName
            })
            if (index > -1) {
              const cluster = this.clusters[index]
              cluster.Isolation = !cluster.Isolation
              this.$set(this.clusters, index, cluster)
            }
          } else if (param.type === 'environment') {
            const index = this.items[
              param.item.Env.Cluster.ClusterName
            ].findIndex((n) => {
              return n.EnvironmentName === param.item.EnvironmentName
            })
            if (index > -1) {
              const env = this.items[param.item.Env.Cluster.ClusterName][index]
              env.Isolation = !env.Isolation
              this.$set(
                this.items[param.item.Env.Cluster.ClusterName],
                index,
                env,
              )
            }
          }
        },
      })
    },
    async environmentDetail(item) {
      this.$router.push({
        name: 'environment-detail',
        params: {
          tenant: this.Tenant().TenantName,
          project: this.Project().ProjectName,
          environment: item.Env.EnvironmentName,
        },
      })
    },
  },
}
</script>

<style>
.v-data-table .v-input__slot {
  background: none !important;
}
.v-expansion-panel-header .v-input__slot {
  background: none !important;
}
</style>
