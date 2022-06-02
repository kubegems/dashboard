<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <BaseSubTitle :title="cluster ? `集群 ${cluster}` : `集群定义`" />
    <v-card-text class="pa-2">
      <v-row v-if="!edit">
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.ClusterID"
            class="my-0"
            :items="m_select_clusterItems"
            :rules="objRules.clusterIDRules"
            color="primary"
            hide-selected
            label="集群"
            no-data-text="暂无可选数据"
            @focus="onClusterSelectFocus"
            @change="onClusterChange"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                class="mx-1"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <ResourceChart
        :quota="quota"
        :nvidia="nvidia"
        :tke="tke"
      />

      <BaseSubTitle title="资源限制" />
      <v-card-text class="px-0 pb-2">
        <v-row class="mx-0">
          <v-col
            cols="4"
            class="px-0 py-0"
          >
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                可用CPU
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }} core
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.cpu']"
                class="my-0"
                required
                :label="edit?'CPU扩容后限制值':'CPU限制值'"
                suffix="core"
                :rules="objRules.cpuRules"
              />
            </v-sheet>
          </v-col>
          <v-col
            cols="4"
            class="pa-0"
          >
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                可用内存
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }} Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.memory']"
                class="my-0"
                required
                :label="edit?'内存扩容后限制值':'内存限制值'"
                suffix="Gi"
                :rules="objRules.memoryRules"
              />
            </v-sheet>
          </v-col>
          <v-col
            cols="4"
            class="px-0 py-0"
          >
            <v-sheet class="px-2">
              <v-flex class="text-subtitle-1">
                可用存储
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }}
                  Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content[`requests.storage`]"
                class="my-0"
                required
                :label="edit?'存储扩容后限制值':'存储限制值'"
                suffix="Gi"
                :rules="objRules.storageRules"
              />
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="nvidia || tke">
        <BaseSubTitle title="GPU资源限制" />
        <v-card-text class="px-0 pb-2">
          <v-row class="mx-0">
            <v-col
              v-if="nvidia"
              cols="4"
              class="px-0 py-0"
            >
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  可用nvidia CPU
                  <span class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedNvidiaGpu.toFixed(1) : 0 }} Gpu
                  </span>
                </v-flex>
                <v-text-field
                  v-model="obj.Content['limits.nvidia.com/gpu']"
                  class="my-0"
                  required
                  :label="edit?'nvidia GPU扩容后限制值':'nvidia GPU限制值'"
                  suffix="Gpu"
                  :rules="objRules.nvidiaRules"
                />
              </v-sheet>
            </v-col>
            <template v-if="tke">
              <v-col
                cols="4"
                class="pa-0"
              >
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    可用tke GPU
                    <span class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeGpu.toFixed(1) : 0 }} 单位 (1单位=0.01 Gpu)
                    </span>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content['tencent.com/vcuda-core']"
                    class="my-0"
                    required
                    :label="edit?'tke GPU扩容后限制值':'tke GPU限制值'"
                    :suffix="`${parseInt(obj.Content['tencent.com/vcuda-core']||0)/100} Gpu`"
                    :rules="objRules.tkeVcudaRules"
                  />
                </v-sheet>
              </v-col>
              <v-col
                cols="4"
                class="px-0 py-0"
              >
                <v-sheet class="px-2">
                  <v-flex class="text-subtitle-1">
                    可用tke显存
                    <span class="text-subtitle-2 primary--text">
                      {{ quota ? quota.AllocatedTkeMemory.toFixed(1) : 0 }} 单位 (1单位=256Mi)
                    </span>
                  </v-flex>
                  <v-text-field
                    v-model="obj.Content[`tencent.com/vcuda-memory`]"
                    class="my-0"
                    required
                    :label="edit?'tke显存扩容后限制值':'tke显存限制值'"
                    :suffix="`${parseInt(obj.Content['tencent.com/vcuda-memory']||0)*256/1024}Gi`"
                    :rules="objRules.tkeVcudaMemoryRules"
                  />
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
import ResourceChart from './ResourceChart'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { required, integer } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceBaseForm',
  components: {
    ResourceChart,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    quota: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
    cluster: {
      type: String,
      default: () => '',
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
    }
  },
  computed: {
    nvidia() {
      if (this.quota) {
        return Object.prototype.hasOwnProperty.call(this.quota, 'NvidiaGpu')
      }
      return false
    },
    tke() {
      if (this.quota) {
        return Object.prototype.hasOwnProperty.call(this.quota, 'TkeGpu') ||
          Object.prototype.hasOwnProperty.call(this.quota, 'TkeMemory')
      }
      return false
    },
    objRules() {
      return {
        clusterIDRules: [required],
        cpuRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedCpu : 0) ||
            '超出最大限制',
        ],
        memoryRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedMemory : 0) ||
            '超出最大限制',
        ],
        storageRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedStorage : 0) ||
            '超出最大限制',
        ],
        nvidiaRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedNvidiaGpu : 0) ||
            '超出最大限制',
        ],
        tkeVcudaRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedTkeGpu : 0) ||
            '超出最大限制',
        ],
        tkeVcudaMemoryRules: [
          required,
          integer,
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedTkeMemory : 0) ||
            '超出最大限制',
        ],
      }
    },
  },
  watch: {
    nvidia: {
      handler(newValue) {
        if (newValue && !this.edit) {
          this.obj.Content['limits.nvidia.com/gpu'] = ''
        }
      },
      deep: true,
    },
    tke: {
      handler(newValue) {
        if (newValue && !this.edit) {
          this.obj.Content['tencent.com/vcuda-core'] = ''
          this.obj.Content['tencent.com/vcuda-memory'] = ''
        }
      },
      deep: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    setContent(data) {
      this.obj.Content = deepCopy(data)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    onClusterSelectFocus() {
      this.m_select_clusterSelectData(null, false)
    },
    onClusterChange() {
      this.$emit('clusterChange', this.obj.ClusterID)
    },
  },
}
</script>

