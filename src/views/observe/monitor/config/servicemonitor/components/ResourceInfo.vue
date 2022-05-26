<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail
          title="关联服务"
          :mt="0"
        >
          <template #content>
            {{
              serviceMonitor
                && serviceMonitor.metadata
                && serviceMonitor.metadata.labels
                ? serviceMonitor.metadata.labels['svc']
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="任务标签">
          <template #content>
            {{ serviceMonitor ? serviceMonitor.spec.jobLabel : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="generation">
          <template #content>
            {{ serviceMonitor ? serviceMonitor.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="匹配标签">
          <template #content>
            <BaseCollapseChips
              v-if="serviceMonitor && serviceMonitor.spec.selector"
              :chips="serviceMonitor.spec.selector.matchLabels || {}"
              single-line
              icon="mdi-label"
            />
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="匹配命名空间">
          <template #content>
            <BaseCollapseChips
              v-if="serviceMonitor && serviceMonitor.spec.namespaceSelector"
              :chips="serviceMonitor.spec.namespaceSelector.matchNames || {}"
              single-line
              icon="mdi-label"
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle
        title="端点集"
        :divider="false"
        class="pt-2"
      />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">端口</th>
              <th class="text-left">路径</th>
              <th class="text-left">超时时间</th>
              <th class="text-left">间隔</th>
              <th class="text-left">指标优先</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in serviceMonitor
                ? serviceMonitor.spec.endpoints
                : []"
              :key="index"
            >
              <td>
                <v-chip
                  color="success"
                  text-color="white"
                  class="ma-1 font-weight-medium"
                  small
                >
                  <span v-if="item.port">{{ item.port }}</span>
                  <span v-else-if="item.targetPort">{{ item.targetPort }}</span>
                </v-chip>
              </td>
              <td>{{ item.path }}</td>
              <td>{{ item.scrapeTimeout }}</td>
              <td>{{ item.interval }}</td>
              <td>
                <span v-if="item.honorLabels">
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
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import BaseResource from '@/mixins/resource'

export default {
  name: 'ResourceInfo',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      serviceMonitor: null,
    }
  },
  watch: {
    item() {
      this.serviceMonitor = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.serviceMonitor = deepCopy(this.item)
  },
}
</script>
