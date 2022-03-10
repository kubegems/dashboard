<template>
  <v-sheet
    max-height="400px"
    class="overflow"
  >
    <BaseListItemForDetail
      v-if="$route.query.type !== 'DaemonSet'"
      title="副本"
      :mt="0"
    >
      <template #content>
        {{
          item && item.status.updatedReplicas ? item.status.updatedReplicas : 0
        }}
        个副本已更新,
        {{ item && item.status.readyReplicas ? item.status.readyReplicas : 0 }}
        个副本已就绪,
        {{
          item && (item.status.availableReplicas || item.status.currentReplicas)
            ? $route.query.type === 'Deployment'
              ? item.status.availableReplicas
              : item.status.currentReplicas
            : 0
        }}
        个副本可用,
        {{
          item && (item.status.availableReplicas || item.status.currentReplicas)
            ? item.status.replicas -
              ($route.query.type === 'Deployment'
                ? item.status.availableReplicas
                : item.status.currentReplicas)
            : 0
        }}
        个副本不可用
      </template>
    </BaseListItemForDetail>

    <BaseListItemForDetail
      title="标签"
      :mt="0"
    >
      <template #content>
        <BaseCollapseChips
          v-if="item"
          :chips="item.metadata.labels || {}"
          single-line
          icon="mdi-label"
        />
      </template>
    </BaseListItemForDetail>

    <BaseListItemForDetail
      title="容器组"
      :mt="0"
    >
      <template #content>
        <v-menu
          open-on-hover
          bottom
          right
          max-height="400px"
          max-width="220px"
          offset-y
          origin="top center"
          transition="scale-transition"
          nudge-bottom="5px"
          :close-delay="200"
        >
          <template #activator="{ on }">
            <span v-on="on">
              <span
                :class="`v-avatar mr-2 ${
                  m_resource_getWorkloadStatus($route.query.type, item) === 'pending'
                    ? 'kubegems__waiting-flashing'
                    : ''
                }`"
                :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                  $WORKLOAD_STATUS_COLOR[
                    m_resource_getWorkloadStatus($route.query.type, item)
                  ]
                };`"
              />
              <span>
                {{
                  m_resource_getWorkloadStatus($route.query.type, item) === 'ready'
                    ? 'Ready'
                    : 'Pending'
                }}
              </span>
              <span>
                ({{
                  item
                    ? item.status.availableReplicas ||
                      item.status.readyReplicas ||
                      0
                    : 0
                }}/{{ item ? item.spec.replicas : 0 }})
              </span>
            </span>
          </template>

          <v-card flat>
            <v-list
              dense
              class="pa-0"
            >
              <v-flex class="text-body-2 text-center primary white--text py-2">
                <v-icon
                  color="white"
                  left
                  small
                >
                  mdi-cube
                </v-icon>
                <span>容器组</span>
              </v-flex>
              <v-list-item v-if="podItems.length > 0">
                <v-list-item-content>
                  <v-list-item
                    two-line
                    class="float-left pa-0"
                  >
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 容器组 </v-list-item-title>
                      <v-list-item-content
                        v-for="(pod, index) in podItems"
                        :key="index"
                        class="text-caption kubegems__detail kubegems__break-all"
                      >
                        <span class="text-caption">
                          容器{{ index + 1 }}：{{ pod.metadata.name }}
                        </span>
                        <span class="text-caption">
                          状态：
                          <span
                            :class="`v-avatar mr-1 ${
                              [
                                'ContainerCreating',
                                'Pending',
                                'Terminating',
                                'PodInitializing',
                              ].indexOf(m_resource_getPodStatus(pod)) > -1
                                ? 'kubegems__waiting-flashing'
                                : ''
                            } text-body-2`"
                            :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                              $POD_STATUS_COLOR[m_resource_getPodStatus(pod)] || '#ff5252'
                            };`"
                          />
                          {{ m_resource_getPodStatus(pod) }}
                        </span>
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-content>
              </v-list-item>
              <v-flex
                v-if="podItems.length === 0"
                class="text-caption text-center py-3"
              >
                暂无容器
              </v-flex>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </BaseListItemForDetail>
  </v-sheet>
</template>

<script>
import { getPodList } from '@/api'
import BaseResource from '@/mixins/resource'

export default {
  name: 'WorkloadInfo',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      podItems: [],
    }
  },
  watch: {
    item() {
      this.podList()
    },
  },
  methods: {
    async podList() {
      const data = await getPodList(
        this.$route.query.cluster,
        this.item.metadata.namespace,
        Object.assign({
          size: 1000,
          topkind: this.$route.query.type,
          topname: this.item.metadata.name,
          noprocessing: true,
        }),
      )
      this.podItems = data.List
    },
  },
}
</script>

<style lang="scss" scoped>
.label-swap {
  word-break: break-word;
  white-space: inherit;
  height: auto;
}

.overflow {
  overflow: auto;
}

.cell-btn {
  display: inline-flex;
}
</style>
