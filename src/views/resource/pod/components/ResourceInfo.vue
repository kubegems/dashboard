<template>
  <v-sheet>
    <v-sheet class="pa-2">
      <BaseListItemForDetail title="节点">
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

    <BaseDivider />

    <BaseSubTitle
      title="容器"
      :divider="false"
      class="mt-2 pl-4"
    />
    <DetailContainer :containers="pod ? pod.spec.containers : []" />

    <BaseDivider />

    <BaseSubTitle
      title="卷"
      :divider="false"
      class="mt-2 pl-4"
    />
    <DetailVolume :volumes="pod ? pod.spec.volumes : []" />

    <BaseDivider />

    <BaseSubTitle
      title="状况"
      :divider="false"
      class="mt-2 pl-4"
    />
    <v-simple-table class="mx-2 pa-2">
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
  </v-sheet>
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
