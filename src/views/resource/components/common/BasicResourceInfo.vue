<template>
  <v-card flat>
    <v-card-title class="text-h6 primary--text">
      {{ item ? item.metadata.name : '' }}
      <template
        v-if="
          Plugins.tke_gpu_manager &&
            item &&
            item.kind === 'Pod' &&
            item.spec &&
            item.spec.nodeSelector &&
            item.spec.nodeSelector['tencent.com/vcuda'] === 'true' &&
            container.resources.requests &&
            container.resources.requests['tencent.com/vcuda-core'] &&
            container.resources.requests['tencent.com/vcuda-memory']
        "
      >
        <v-menu
          top
          open-on-hover
          :close-delay="200"
        >
          <template #activator="{ on }">
            <span
              class="mt-1 mr-2"
              v-on="on"
            >
              <Logo icon-name="tke_gpu_manager" />
            </span>
          </template>
          <v-card>
            <v-card-text class="pa-2">tke_gpu_manager </v-card-text>
          </v-card>
        </v-menu>
      </template>
      <template
        v-if="
          Plugins.nvidia_device_plugin &&
            item &&
            item.kind === 'Pod' &&
            item.spec &&
            item.spec.nodeSelector &&
            item.spec.nodeSelector['nvidia.com/gpu'] === 'true' &&
            container.resources.requests &&
            container.resources.requests['nvidia.com/gpu']
        "
      >
        <v-menu
          top
          open-on-hover
          :close-delay="200"
        >
          <template #activator="{ on }">
            <span
              class="mt-1 mr-2"
              v-on="on"
            >
              <Logo icon-name="nvidia_device_plugin" />
            </span>
          </template>
          <v-card>
            <v-card-text class="pa-2"> nvidia_device_plugin </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2"> 集群 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? ThisCluster : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      v-if="project"
      two-line
    >
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2"> 项目 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{
            item
              ? item.metadata.labels
                ? item.metadata.labels[`gems.cloudminds.com/project`]
                : ''
              : ''
          }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      v-if="environment"
      two-line
    >
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2"> 环境 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{
            item
              ? item.metadata.labels
                ? item.metadata.labels[`gems.cloudminds.com/environment`]
                : ''
              : ''
          }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2">
          创建时间
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{
            item ? $moment(item.metadata.creationTimestamp).format('lll') : ''
          }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import Logo from './Logo'
import BaseResource from '@/mixins/resource'

export default {
  name: 'BasicResourceInfo',
  components: { Logo },
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    project: {
      type: Boolean,
      default: () => true,
    },
    environment: {
      type: Boolean,
      default: () => true,
    },
  },
  computed: {
    ...mapState(['Plugins']),
  },
}
</script>
