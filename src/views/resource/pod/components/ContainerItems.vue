<template>
  <v-flex>
    <span>容器</span>
    <v-sheet v-if="containerStatusesCopy.length === 0" class="grey lighten-4 rounded my-1 py-6 text-center">
      暂无容器
    </v-sheet>
    <v-sheet v-for="(container, index) in containerStatusesCopy" :key="index" class="grey lighten-4 rounded my-1">
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" style="width: 515px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-icon class="float-left mt-1" color="primary" left small> mdi-cube </v-icon>
                  <v-flex class="float-left">
                    {{ container.name }}
                  </v-flex>
                  <v-flex v-if="tke" class="float-left mt-1 ml-2 icon-height">
                    <BaseLogo icon-name="tke" :width="16" />
                  </v-flex>
                  <v-flex v-if="nvidia" class="float-left mt-1 ml-2 icon-height">
                    <BaseLogo icon-name="nvidia" :width="16" />
                  </v-flex>
                  <v-icon
                    v-if="
                      (container.state && container.state.running !== undefined) ||
                      (item.metadata.deletionTimestamp ? 'Terminating' : item.status.phase) === 'Succeeded' ||
                      (container.state && container.state.waiting)
                    "
                    class="kubegems__pointer"
                    color="primary float-left"
                    right
                    small
                    @click="containerLog(container.name, item)"
                  >
                    mdi-file-document
                  </v-icon>
                  <v-icon
                    v-if="m_permisson_resourceAllow && container.state && container.state.running !== undefined"
                    class="kubegems__pointer"
                    color="primary float-left"
                    right
                    small
                    @click="containerShell(container.name, item)"
                  >
                    mdi-console
                  </v-icon>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ container.image }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span
                    :class="`v-avatar mr-2 ${
                      getContainerStatus(container) === 'Waiting' ? 'kubegems__waiting-flashing' : ''
                    }`"
                    :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                      $CONTAINER_STATUS_COLOR[getContainerStatus(container)]
                    };`"
                  />
                  <span v-if="container.state.running"> Running </span>
                  <span v-else-if="container.state.terminated">
                    Terminated({{ container.state.terminated.reason }})
                  </span>
                  <span v-else-if="container.state.waiting"> Waiting({{ container.state.waiting.reason }}) </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 状态 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-flex
                    v-for="(probe, index) in getContainerProbes(item, container)"
                    :key="index"
                    class="float-left mr-2"
                  >
                    <ProbeTip :item="probe.probe" :title="probe.title" />
                  </v-flex>
                  <v-flex v-if="getContainerProbes(item, container).length === 0" class="float-left mr-1">
                    暂无探针
                  </v-flex>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 探针 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 150px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ container.restartCount }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 重启次数 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 150px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span v-if="container.state.running">
                    {{
                      container.state.running.startedAt
                        ? $moment(container.state.running.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : ''
                    }}
                  </span>
                  <span v-else-if="container.state.terminated">
                    {{
                      container.state.terminated.startedAt
                        ? $moment(container.state.terminated.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : '未知'
                    }}
                  </span>
                  <span v-else>暂无</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> Age </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 150px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ container.resources && container.resources.limits ? container.resources.limits.cpu : '无限制' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.cpu </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" style="width: 150px" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ container.resources && container.resources.limits ? container.resources.limits.memory : '无限制' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.memory </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
      </v-list-item>
    </v-sheet>

    <ContainerLog ref="containerLog" />
    <Terminal ref="terminal" />
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import ContainerLog from '@/views/resource/components/common/ContainerLog';
  import ProbeTip from '@/views/resource/components/common/ProbeTip';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'ContainerItems',
    components: {
      ContainerLog,
      ProbeTip,
      Terminal,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
      containerStatuses: {
        type: Array,
        default: () => [],
      },
      item: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        containerStatusesCopy: [],
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      tke() {
        if (this?.item?.spec?.nodeSelector) {
          return this.item.spec.nodeSelector['tencent.com/vcuda'] === 'true';
        }
        return false;
      },
      nvidia() {
        if (this?.item?.spec?.nodeSelector) {
          return this.item.spec.nodeSelector['nvidia.com/gpu'] === 'true';
        }
        return false;
      },
    },
    watch: {
      containerStatuses: {
        handler() {
          this.containerStatusesCopy = deepCopy(this.containerStatuses);
          this.containers.forEach((c) => {
            const index = this.containerStatusesCopy.findIndex((s) => {
              return s.name === c.name;
            });
            if (index > -1) {
              const container = this.containerStatusesCopy[index];
              container.image = c.image;
              container.resources = c.resources;
              this.$set(this.containerStatusesCopy, index, container);
            }
          });
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      getContainerStatus(item) {
        if (item.state) {
          if (item.state.running) return 'Running';
          if (item.state.terminated) return 'Terminated';
          if (item.state.waiting) return 'Waiting';
        } else return 'Failed';
      },
      getContainerProbes(item, container) {
        const probes = [];
        const spec = item.spec.containers.find((c) => {
          return (c.name = container.name);
        });
        if (spec) {
          if (spec.livenessProbe) {
            probes.push({ title: '存活探针', probe: spec.livenessProbe });
          }
          if (spec.readinessProbe) {
            probes.push({ title: '就绪探针', probe: spec.readinessProbe });
          }
          if (spec.startupProbe) {
            probes.push({ title: '启动探针', probe: spec.startupProbe });
          }
        }
        return probes;
      },
      containerLog(container, pod) {
        const item = {
          namespace: pod.metadata.namespace,
          name: pod.metadata.name,
          containers: pod.status.containerStatuses.concat(
            pod.spec.initContainers
              ? pod.spec.initContainers.map((i) => {
                  return { ...i, showName: `${i.name} (init)` };
                })
              : [],
          ),
        };
        this.$refs.containerLog.init(container, item);
        this.$refs.containerLog.open();
      },
      containerShell(container, pod) {
        const item = {
          namespace: pod.metadata.namespace,
          name: pod.metadata.name,
          containers: pod.status.containerStatuses,
        };
        this.$refs.terminal.init(container, item, 'shell');
        this.$refs.terminal.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .icon-height {
    height: 16px;
  }
</style>
