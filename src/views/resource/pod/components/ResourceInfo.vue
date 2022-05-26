<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail
          title="节点"
          :mt="0"
        >
          <template #content>
            {{ pod ? pod.spec.nodeName : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="容器组IP">
          <template #content>
            {{ pod ? pod.status.podIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="节点IP">
          <template #content>
            {{ pod ? pod.status.hostIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="QOS">
          <template #content>
            {{ pod ? pod.status.qosClass : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle
        title="容器"
        :divider="false"
        class="pt-2"
      />
      <DetailContainer :containers="pod ? pod.spec.containers : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle
        title="卷"
        :divider="false"
        class="pt-2"
      />
      <DetailVolume :volumes="pod ? pod.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle
        title="状况"
        :divider="false"
        class="pt-2"
      />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">状态</th>
              <th class="text-left">上次改变时间</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in pod ? pod.status.conditions : []"
              :key="index"
            >
              <td>{{ item.type }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon
                    small
                    color="primary"
                  > fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon
                    small
                    color="error"
                  >fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
import DetailContainer from '@/views/resource/components/common/DetailContainer'
import DetailVolume from '@/views/resource/components/common/DetailVolume'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceInfo',
  components: {
    DetailContainer,
    DetailVolume,
  },
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      pod: null,
    }
  },
  watch: {
    item() {
      this.pod = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.pod = deepCopy(this.item)
  },
}
</script>
