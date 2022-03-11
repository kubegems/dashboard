<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <BaseSubTitle title="集群厂商" />
      <v-card-text class="pa-2">
        <v-row class="mt-0">
          <v-col
            v-for="(item, index) in vendorItems"
            :key="index"
            cols="4"
          >
            <v-hover
              #default="{ hover }"
            >
              <v-card
                :elevation="hover ? 5 : 1"
                class="kubegems__pointer vendor-pos"
                @click="selectVendor(item)"
              >
                <v-list-item three-line>
                  <v-list-item-avatar
                    class="primary--text"
                    tile
                    size="50"
                  >
                    <BaseLogo
                      :icon-name="item.icon"
                      :width="40"
                    />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 kubegems__pointer">
                      {{ item.vendor }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-body-2"> 支持版本： </span>
                      v1.18.0 -- v1.20.18
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="obj.Vendor === item.value">
                  <v-flex
                    class="vendor-watermark-bg"
                  />
                  <v-flex
                    class="vendor-watermark font-weight-medium"
                  >
                    当前选择
                  </v-flex>
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
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
        lang="yaml"
        :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
        theme="chrome"
        height="500"
        @init="$aceinit"
        @keydown.stop
      />
    </v-card-text>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ValidateKubeConfig',
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
      ImageRepo: 'docker.io/kubegems',
      DefaultStorageClass: '',
      extend: {
        storageClasses: [],
        validate: 'progressing',
        clusterName: '',
        existInstaller: false,
      },
    },
    vendorItems: [
      { vendor: 'Kubernetes Self-host', value: 'selfhosted', icon: 'selfhosted' },
      { vendor: 'Aliyun ACK', value: 'aliyun', icon: 'aliyun' },
      { vendor: 'GoogleCloud GKE', value: 'gke', icon: 'gke' },
    ],
  }),
  computed: {
    ...mapState(['Scale']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
    },
    selectVendor(item) {
      if (this.edit) return
      this.obj.Vendor = item.value
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    getExtend() {
      return this.obj.extend
    },
  },
}
</script>

<style scoped>
.vendor-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vendor-watermark-bg {
  position: absolute;
  width: 100px;
  height: 90px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.vendor-watermark {
  position: absolute;
  top: 10px;
  right: -4px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}
</style>
